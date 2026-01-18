// backend/controllers/pickupRequestController.js
const PickupRequest = require('../models/PickupRequest');
const Donation = require('../models/Donation');
const Organization = require('../models/Organization');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail, generateEmailTemplate } = require('../utils/emailUtils');
const { awardPoints, POINTS_CONFIG } = require('../utils/pointsUtils');
const mongoose = require('mongoose');

/**
 * Helper to resolve a donation using either an ObjectId or a uuid string.
 */
async function findDonationByIdOrUuid(id) {
  if (!id) return null;

  // If looks like ObjectId, try findById first
  if (mongoose.Types.ObjectId.isValid(id)) {
    try {
      const byId = await Donation.findById(id);
      if (byId) return byId;
    } catch (err) {
      console.warn('Error finding by ObjectId:', err.message);
    }
  }

  // Otherwise try finding by uuid field
  try {
    const byUuid = await Donation.findOne({ uuid: id });
    if (byUuid) return byUuid;
  } catch (err) {
    console.warn('Error finding by uuid:', err.message);
  }

  return null;
}

/**
 * Create Pickup Request
 */
exports.createPickupRequest = async (req, res) => {
  try {
    const { donation_id, organization_id, requested_quantity, pickup_date, pickup_time, special_instructions } = req.body;

    // Ensure authenticated user
    const requesterId = req.user && (req.user.id || req.user._id);
    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Validate required fields
    if (!donation_id) {
      return res.status(400).json({ success: false, message: 'donation_id is required' });
    }
    const qty = Number(requested_quantity || 0);
    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, message: 'requested_quantity must be a positive number' });
    }

    // Find donation by _id or uuid
    const donation = await findDonationByIdOrUuid(donation_id);
    if (!donation) {
      console.error('Donation not found with id:', donation_id);
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Check quantity availability
    const available = Number(donation.availability_count || 0);
    if (qty > available) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available quantity' });
    }

    // Donation must be AVAILABLE
    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({ success: false, message: 'Donation is not available for request' });
    }

    // Prepare organization reference if provided and valid
    let orgRef = undefined;
    if (organization_id) {
      // Only try to find if it looks like a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(organization_id)) {
        try {
          const org = await Organization.findById(organization_id);
          if (org) orgRef = org._id;
        } catch (err) {
          // Ignore organization lookup errors; organization is optional
        }
      }
    }

    // Create pickup request document
    const pickupRequest = new PickupRequest({
      donation: donation._id,
      receiver: requesterId,
      organization: orgRef,
      requested_quantity: qty,
      pickup_date: pickup_date ? new Date(pickup_date) : undefined,
      pickup_time: pickup_time || undefined,
      special_instructions: special_instructions || '',
      status: 'PENDING'
    });

    await pickupRequest.save();

    // Award points to volunteer/receiver for creating pickup request (accepting donation)
    try {
      await awardPoints(
        requesterId,
        POINTS_CONFIG.PICKUP,
        'PICKUP',
        `Volunteered for pickup: ${donation.food_type || 'food'} (${qty} ${donation.unit})`,
        { pickupRequestId: pickupRequest._id, donationId: donation._id, foodType: donation.food_type }
      );
    } catch (pointsErr) {
      console.error('Points award error (non-fatal):', pointsErr);
    }

    // Update donation: mark accepted by volunteer and set status to ALLOCATED
    const volunteerUser = await User.findById(requesterId).select('first_name last_name');
    const volunteerName = volunteerUser ? `${volunteerUser.first_name || ''} ${volunteerUser.last_name || ''}`.trim() : 'Volunteer';

    donation.availability_count = available - qty;
    if (donation.availability_count < 0) donation.availability_count = 0;
    // Mark as accepted by volunteer (use ACCEPTED status for clarity to donor)
    donation.status = 'ACCEPTED';
    donation.accepted_by = {
      user: requesterId,
      name: volunteerName,
      organization: orgRef || null,
      via: 'VOLUNTEER'
    };
    await donation.save();

    // Notify donor (non-blocking)
    (async () => {
      try {
        // donor field might be ObjectId reference or a different field name depending on model
        const donorId = donation.donor || donation.donor_id || null;
        if (donorId) {
          await Notification.create({
            user: donorId,
            type: 'DONATION_ACCEPTED',
            title: 'Donation Accepted',
            message: `${volunteerName} accepted your donation "${donation.food_type || ''}".`,
            related_entity_id: pickupRequest._id,
            related_entity_type: 'PICKUP_REQUEST',
            metadata: { donationId: donation._id, volunteerId: requesterId }
          });

          const donor = await User.findById(donorId);
          if (donor && donor.email && sendEmail) {
            const html = generateEmailTemplate('New Pickup Request', `A pickup request has been made for your donation "${donation.food_type || ''}".`);
            // don't await, just catch errors
            sendEmail(donor.email, 'New Pickup Request', html).catch(err => console.error('Email send error:', err));
          }
        }
      } catch (notifyErr) {
        console.error('Notification/email non-fatal error:', notifyErr);
      }
    })();

    return res.status(201).json({
      success: true,
      message: 'Pickup request created successfully',
      pickupRequest
    });
  } catch (error) {
    console.error('Create pickup request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating pickup request',
      error: error.message
    });
  }
};

/**
 * Get Pickup Requests (supports filters: type=sent/received, status)
 */
exports.getPickupRequests = async (req, res) => {
  try {
    const { status, type } = req.query;
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const filter = {};
    if (type === 'sent') {
      filter.receiver = userId;
    } else if (type === 'received') {
      // find donations owned by this user
      const userDonations = await Donation.find({ donor: userId }).select('_id').lean();
      const donationIds = userDonations.map(d => d._id);
      filter.donation = { $in: donationIds };
    }

    if (status) filter.status = status;

    const requests = await PickupRequest.find(filter)
      .populate({ path: 'donation' })
      .populate({ path: 'receiver', select: 'first_name last_name phone email' })
      .populate({ path: 'organization' })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Get pickup requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching pickup requests',
      error: error.message
    });
  }
};

/**
 * Get Single Pickup Request by UUID
 */
exports.getPickupRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await PickupRequest.findOne({ uuid: id })
      .populate({ path: 'donation' })
      .populate({ path: 'receiver', select: 'first_name last_name phone email' })
      .populate({ path: 'organization' })
      .lean();

    if (!request) {
      return res.status(404).json({ success: false, message: 'Pickup request not found' });
    }

    return res.json({ success: true, request });
  } catch (error) {
    console.error('Get pickup request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching pickup request',
      error: error.message
    });
  }
};

/**
 * Confirm Pickup Request (donor confirms)
 */
exports.confirmPickupRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const request = await PickupRequest.findOne({ uuid: id });
    if (!request) return res.status(404).json({ success: false, message: 'Pickup request not found' });

    const donation = await Donation.findById(request.donation);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

    // Verify donor
    if (donation.donor.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to confirm this request' });
    }

    request.status = 'CONFIRMED';
    await request.save();

    donation.status = 'ALLOCATED';
    await donation.save();

    // Notify receiver (non-blocking)
    (async () => {
      try {
        await Notification.create({
          user: request.receiver,
          type: 'PICKUP_CONFIRMED',
          title: 'Pickup Confirmed',
          message: 'Your pickup request has been confirmed',
          related_entity_id: request._id,
          related_entity_type: 'PICKUP_REQUEST'
        });

        const receiver = await User.findById(request.receiver);
        if (receiver && receiver.email && sendEmail) {
          const html = generateEmailTemplate('Pickup Confirmed', 'Your pickup request has been confirmed by the donor.');
          sendEmail(receiver.email, 'Pickup Confirmed', html).catch(err => console.error('Email error:', err));
        }
      } catch (notifyErr) {
        console.error('Notification non-fatal error:', notifyErr);
      }
    })();

    return res.json({ success: true, message: 'Pickup request confirmed', request });
  } catch (error) {
    console.error('Confirm pickup request error:', error);
    return res.status(500).json({ success: false, message: 'Error confirming pickup request', error: error.message });
  }
};

/**
 * Reject Pickup Request (donor rejects)
 */
exports.rejectPickupRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const request = await PickupRequest.findOne({ uuid: id });
    if (!request) return res.status(404).json({ success: false, message: 'Pickup request not found' });

    const donation = await Donation.findById(request.donation);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

    // Verify donor
    if (donation.donor.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this request' });
    }

    request.status = 'REJECTED';
    request.rejection_reason = rejection_reason || '';
    await request.save();

    // Restore donation availability
    donation.status = 'AVAILABLE';
    donation.availability_count = (donation.availability_count || 0) + (request.requested_quantity || 0);
    await donation.save();

    return res.json({ success: true, message: 'Pickup request rejected', request });
  } catch (error) {
    console.error('Reject pickup request error:', error);
    return res.status(500).json({ success: false, message: 'Error rejecting pickup request', error: error.message });
  }
};

/**
 * Mark as Picked Up
 */
exports.markAsPickedUp = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await PickupRequest.findOne({ uuid: id });
    if (!request) return res.status(404).json({ success: false, message: 'Pickup request not found' });

    request.status = 'PICKED_UP';
    request.completed_at = new Date();
    await request.save();

    // Update donation status
    const donation = await Donation.findById(request.donation);
    if (donation) {
      donation.status = 'PICKED_UP';
      await donation.save();
    }

    // Award points to volunteer/picker for completing pickup
    try {
      const volunteerId = request.organization || request.receiver;
      if (volunteerId) {
        await awardPoints(
          volunteerId,
          POINTS_CONFIG.PICKUP,
          'PICKUP',
          `Completed pickup for donation`,
          { pickupRequestId: request._id, donationId: request.donation }
        );
      }
    } catch (pointsErr) {
      console.error('Points award error (non-fatal):', pointsErr);
    }

    return res.json({ success: true, message: 'Marked as picked up', request });
  } catch (error) {
    console.error('Mark picked up error:', error);
    return res.status(500).json({ success: false, message: 'Error marking as picked up', error: error.message });
  }
};

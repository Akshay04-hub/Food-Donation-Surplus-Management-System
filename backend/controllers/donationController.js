// const Donation = require('../models/Donation');
// const User = require('../models/User');
// const Notification = require('../models/Notification');
// const { sendEmail, generateEmailTemplate } = require('../utils/emailUtils');
// const { Op } = require('sequelize');

// // Create Donation
// exports.createDonation = async (req, res) => {
//   try {
//     const {
//       food_type,
//       food_category,
//       quantity,
//       unit, 
//       description,
//       preparation_date,
//       expiry_date,
//       storage_condition,
//       location_latitude,
//       location_longitude,
//       address,
//       city,
//       contact_name,
//       contact_phone,
//       contact_email
//     } = req.body;

//     // Validate dates
//     if (new Date(preparation_date) > new Date(expiry_date)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Expiry date must be after preparation date'
//       });
//     }

//     // Create donation
//     const donation = await Donation.create({
//       donor_id: req.user.id,
//       food_type,
//       food_category,
//       quantity,
//       unit,
//       description,
//       preparation_date,
//       expiry_date,
//       storage_condition,
//       location_latitude,
//       location_longitude,
//       address,
//       city,
//       contact_name,
//       contact_phone,
//       contact_email,
//       image_url: req.file ? `/uploads/${req.file.filename}` : null,
//       status: 'AVAILABLE',
//       availability_count: quantity
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Donation created successfully',
//       donation
//     });
//   } catch (error) {
//     console.error('Create donation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating donation',
//       error: error.message
//     });
//   }
// };

// // Get All Donations with Filters
// exports.getDonations = async (req, res) => {
//   try {
//     const { city, status, food_category, latitude, longitude, radius = 10 } = req.query;

//     let whereClause = { status: 'AVAILABLE' };

//     if (city) {
//       whereClause.city = city;
//     }

//     if (status) {
//       whereClause.status = status;
//     }

//     if (food_category) {
//       whereClause.food_category = food_category;
//     }

//     // Get donations
//     const donations = await Donation.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: User,
//           attributes: ['first_name', 'last_name', 'phone', 'email']
//         }
//       ],
//       order: [['created_at', 'DESC']],
//       limit: 50
//     });

//     // Filter by distance if coordinates provided
//     let filteredDonations = donations;
//     if (latitude && longitude) {
//       filteredDonations = donations.filter(donation => {
//         const distance = calculateDistance(latitude, longitude, donation.location_latitude, donation.location_longitude);
//         return distance <= radius;
//       });
//     }

//     res.json({
//       success: true,
//       count: filteredDonations.length,
//       donations: filteredDonations
//     });
//   } catch (error) {
//     console.error('Get donations error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching donations',
//       error: error.message
//     });
//   }
// };

// // Get Single Donation
// exports.getDonationById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const donation = await Donation.findOne({
//       where: { uuid: id },
//       include: [
//         {
//           model: User,
//           attributes: ['first_name', 'last_name', 'phone', 'email', 'profile_image_url']
//         }
//       ]
//     });

//     if (!donation) {
//       return res.status(404).json({
//         success: false,
//         message: 'Donation not found'
//       });
//     }

//     res.json({
//       success: true,
//       donation
//     });
//   } catch (error) {
//     console.error('Get donation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching donation',
//       error: error.message
//     });
//   }
// };

// // Update Donation
// exports.updateDonation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     const donation = await Donation.findOne({ where: { uuid: id } });

//     if (!donation) {
//       return res.status(404).json({
//         success: false,
//         message: 'Donation not found'
//       });
//     }

//     if (donation.donor_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to update this donation'
//       });
//     }

//     await donation.update(updates);

//     res.json({
//       success: true,
//       message: 'Donation updated successfully',
//       donation
//     });
//   } catch (error) {
//     console.error('Update donation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating donation',
//       error: error.message
//     });
//   }
// };

// // Cancel Donation
// exports.cancelDonation = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const donation = await Donation.findOne({ where: { uuid: id } });

//     if (!donation) {
//       return res.status(404).json({
//         success: false,
//         message: 'Donation not found'
//       });
//     }

//     if (donation.donor_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to cancel this donation'
//       });
//     }

//     await donation.update({ status: 'CANCELLED' });

//     res.json({
//       success: true,
//       message: 'Donation cancelled successfully',
//       donation
//     });
//   } catch (error) {
//     console.error('Cancel donation error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error cancelling donation',
//       error: error.message
//     });
//   }
// };

// // Helper function to calculate distance between two coordinates
// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//   const R = 6371; // Earth's radius in km
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;
//   const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

// module.exports.calculateDistance = calculateDistance;
// controllers/donationController.js
const Donation = require('../models/Donation');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail, generateEmailTemplate } = require('../utils/emailUtils');
const Organization = require('../models/Organization');
const { awardPoints, POINTS_CONFIG } = require('../utils/pointsUtils');
const mongoose = require('mongoose');

// Mark donations as expired when their expiry_date is in the past
async function expireStaleDonations() {
  const now = new Date();
  try {
    const res = await Donation.updateMany(
      {
        expiry_date: { $lt: now },
        // Only expire items that are still available; keep allocated/requested visible as allocated
        status: 'AVAILABLE'
      },
      { status: 'EXPIRED' }
    );
    return res.modifiedCount || res.nModified || 0;
  } catch (err) {
    console.error('expireStaleDonations error:', err);
    return 0;
  }
}

// derive an acceptance score (1-5) based on acceptance ratio
function computeAcceptanceScore(accepted, decisions) {
  const dec = Number(decisions) || 0;
  if (!dec) return 0;
  const ratio = Math.max(0, Math.min(1, (Number(accepted) || 0) / dec));
  return Number((1 + ratio * 4).toFixed(2));
}

// Create Donation
exports.createDonation = async (req, res) => {
  try {
    const {
      food_type,
      food_category,
      quantity,
      unit,
      description,
      preparation_date,
      expiry_date,
      storage_condition,
      location_latitude,
      location_longitude,
      address,
      city,
      contact_name,
      contact_phone,
      contact_email
    } = req.body;

    const normalizedContactPhone = (contact_phone || '').toString().replace(/\D/g, '');
    if (!normalizedContactPhone || normalizedContactPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Contact phone must be exactly 10 digits'
      });
    }

    // Validate dates
    if (new Date(preparation_date) > new Date(expiry_date)) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be after preparation date'
      });
    }

    // Prevent creating already-expired donations
    if (new Date(expiry_date) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be in the future'
      });
    }

    // donor id from req.user (accept either req.user.id or req.user._id)
    const donorId = req.user && (req.user.id || req.user._id);
    if (!donorId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Create donation document
    const donationData = {
      donor: donorId,
      food_type,
      food_category,
      quantity,
      unit,
      description,
      preparation_date,
      expiry_date,
      storage_condition,
      location_latitude,
      location_longitude,
      address,
      city,
      contact_name,
      contact_phone: normalizedContactPhone,
      contact_email,
      image_url: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'AVAILABLE',
      availability_count: quantity
    };

    // Optionally associate with an organization (sent as organization_uuid)
    if (req.body.organization_uuid) {
      try {
        const org = await Organization.findOne({ uuid: req.body.organization_uuid });
        if (!org) {
          return res.status(400).json({ success: false, message: 'Selected organization not found' });
        }
        if (!org.is_active || org.verification_status !== 'APPROVED') {
          return res.status(400).json({ success: false, message: 'Selected organization is not available for donations' });
        }
        donationData.organization = org._id;
      } catch (orgErr) {
        console.warn('Could not resolve organization for donation:', orgErr);
      }
    }

    const donation = new Donation(donationData);
    await donation.save();

    // Award points to donor for donation
    try {
      await awardPoints(
        donorId,
        POINTS_CONFIG.DONATION,
        'DONATION',
        `Donated ${quantity} ${unit} of ${food_type}`,
        { donationId: donation._id, foodType: food_type, quantity: quantity }
      );
    } catch (pointsErr) {
      console.error('Points award error (non-fatal):', pointsErr);
    }

    // Log activity
    try {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.create({
        user: donorId,
        donation: donation._id,
        action: 'CREATED',
        description: `Created donation: ${food_type}`,
        details: { food_type, quantity, unit }
      });
    } catch (logErr) {
      console.error('Activity log creation error (create):', logErr);
    }

    // Optionally: send notification/email logic (if you have Notification model implemented)
    // Example (non-blocking):
    try {
      // create notification doc if Notification model exists
      if (Notification) {
        await Notification.create({
          user: donorId,
          type: 'DONATION_AVAILABLE',
          title: 'Donation created',
          message: `Your donation "${donation.food_type}" has been created.`,
          metadata: { donationId: donation._id }
        });
      }

      // send email (non-blocking)
      if (contact_email && sendEmail) {
        const html = generateEmailTemplate('Donation Created', `Thanks, your donation has been posted.`);
        sendEmail(contact_email, 'Donation Created', html).catch(err => console.error('Email error:', err));
      }
    } catch (notifyErr) {
      console.error('Notification/email error (non-fatal):', notifyErr);
    }

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      donation
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating donation', 
      error: error.message
    });
  }
};

// NGO or Volunteer accepts a donation
exports.acceptDonation = async (req, res) => {
  try {
    const { id } = req.params; // uuid or _id
    const acceptorUserId = req.user && (req.user.id || req.user._id);
    const acceptorRole = req.user && req.user.role;
    if (!acceptorUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Immediately expire if past expiry_date
    await expireStaleDonations();

    let donation = await Donation.findOne({ uuid: id });
    if (!donation && mongoose.Types.ObjectId.isValid(id)) {
      donation = await Donation.findById(id);
    }
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

    if (donation.expiry_date && new Date(donation.expiry_date) < new Date()) {
      donation.status = 'EXPIRED';
      await donation.save();
      return res.status(400).json({ success: false, message: 'Donation has expired' });
    }

    if (donation.status !== 'AVAILABLE') return res.status(400).json({ success: false, message: 'Donation not available' });

    const acceptorUser = await User.findById(acceptorUserId).select('first_name last_name role');
    const acceptorName = acceptorUser ? `${acceptorUser.first_name || ''} ${acceptorUser.last_name || ''}`.trim() : (acceptorRole || 'User');

    // Find the NGO's organization 
    let ngoOrganization = null;
    try {
      if (acceptorRole === 'NGO') {
        ngoOrganization = await Organization.findOne({ created_by: acceptorUserId });
      }
    } catch (orgErr) {
      console.warn('Could not find organization for NGO user:', orgErr);
    }

    donation.status = 'ALLOCATED';
    donation.accepted_by = { 
      user: acceptorUserId, 
      name: acceptorName,
      organization: ngoOrganization ? ngoOrganization._id : null,
      role: acceptorRole
    };
    await donation.save();

    // Award points to NGO/Volunteer for accepting donation
    try {
      await awardPoints(
        acceptorUserId,
        POINTS_CONFIG.PICKUP,
        'PICKUP',
        `Accepted donation: ${donation.food_type || 'food'} (${donation.quantity} ${donation.unit})`,
        { donationId: donation._id, foodType: donation.food_type, quantity: donation.quantity }
      );
    } catch (pointsErr) {
      console.error('Points award error (non-fatal):', pointsErr);
    }

    // Update NGO acceptance-based rating
    if (ngoOrganization) {
      ngoOrganization.accepted_count = (ngoOrganization.accepted_count || 0) + 1;
      ngoOrganization.decision_count = (ngoOrganization.decision_count || 0) + 1;
      ngoOrganization.acceptance_score = computeAcceptanceScore(ngoOrganization.accepted_count, ngoOrganization.decision_count);
      ngoOrganization.average_rating = ngoOrganization.acceptance_score;
      ngoOrganization.rating_count = ngoOrganization.decision_count;
      await ngoOrganization.save();
    }

    // Log activity
    try {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.create({
        user: acceptorUserId,
        donation: donation._id,
        action: 'ACCEPTED',
        description: `${acceptorName} accepted this donation (${acceptorRole || 'User'})`,
        details: { acceptorName, acceptorRole }
      });
    } catch (logErr) {
      console.error('Activity log creation error (accept):', logErr);
    }

    // Notify donor
    try {
      if (Notification) {
        await Notification.create({
          user: donation.donor,
          type: 'DONATION_ACCEPTED',
          title: 'Donation Accepted',
          message: `${acceptorName} (${acceptorRole || 'User'}) accepted your donation "${donation.food_type}"`,
          related_entity_id: donation._id,
          related_entity_type: 'Donation',
          metadata: { donationId: donation._id, acceptorId: acceptorUserId, acceptorRole }
        });
      }
    } catch (notifErr) {
      console.error('Notification creation error (accept):', notifErr);
    }

    // Update any prior "donation rejected" notifications to reflect acceptance
    try {
      if (Notification) {
        await Notification.updateMany(
          { related_entity_id: donation._id, type: 'DONATION_REJECTED' },
          {
            type: 'DONATION_ACCEPTED',
            title: 'Donation Accepted',
            message: `${acceptorName} (${acceptorRole || 'User'}) accepted donation "${donation.food_type}"`,
            is_read: false,
            metadata: { donationId: donation._id, acceptorId: acceptorUserId, acceptorRole }
          }
        );
      }
    } catch (notifUpdateErr) {
      console.error('Notification update error (accept -> resolve rejection):', notifUpdateErr);
    }

    res.json({ success: true, message: 'Donation accepted', donation });
  } catch (error) {
    console.error('Accept donation error:', error);
    res.status(500).json({ success: false, message: 'Error accepting donation', error: error.message });
  }
};

// NGO rejects a donation
exports.rejectDonation = async (req, res) => {
  try {
    const { id } = req.params; // uuid or _id
    const ngoUserId = req.user && (req.user.id || req.user._id);
    if (!ngoUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await expireStaleDonations();

    let donation = await Donation.findOne({ uuid: id });
    if (!donation && mongoose.Types.ObjectId.isValid(id)) {
      donation = await Donation.findById(id);
    }
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

    if (donation.expiry_date && new Date(donation.expiry_date) < new Date()) {
      donation.status = 'EXPIRED';
      await donation.save();
      return res.status(400).json({ success: false, message: 'Donation has expired' });
    }

    if (donation.status !== 'AVAILABLE') return res.status(400).json({ success: false, message: 'Donation not available' });

    const ngoUser = await User.findById(ngoUserId).select('first_name last_name');
    const ngoName = ngoUser ? `${ngoUser.first_name || ''} ${ngoUser.last_name || ''}`.trim() : 'NGO';

    // Find NGO organization
    let ngoOrganization = null;
    try {
      ngoOrganization = await Organization.findOne({ created_by: ngoUserId });
    } catch (orgErr) {
      console.warn('Could not find organization for NGO user (reject):', orgErr);
    }

    // Track rejection info on donation
    donation.accepted_by = {
      user: ngoUserId,
      name: ngoName,
      organization: ngoOrganization ? ngoOrganization._id : null,
      rejected: true
    };
    await donation.save();

    // Update NGO acceptance-based rating (decision counted, no accept increment)
    if (ngoOrganization) {
      const accepted = ngoOrganization.accepted_count || 0;
      ngoOrganization.decision_count = (ngoOrganization.decision_count || 0) + 1;
      ngoOrganization.acceptance_score = computeAcceptanceScore(accepted, ngoOrganization.decision_count);
      ngoOrganization.average_rating = ngoOrganization.acceptance_score;
      ngoOrganization.rating_count = ngoOrganization.decision_count;
      await ngoOrganization.save();
    }

    // Log activity
    try {
      const ActivityLog = require('../models/ActivityLog');
      await ActivityLog.create({
        user: ngoUserId,
        donation: donation._id,
        action: 'REJECTED',
        description: `${ngoName} rejected this donation`,
        details: { ngoName }
      });
    } catch (logErr) {
      console.error('Activity log creation error (reject):', logErr);
    }

    // Keep donation as AVAILABLE (so others can accept) but log rejection via notification
    try {
      // notify volunteers about rejected donation
      const volunteers = await User.find({ role: 'VOLUNTEER' }).select('_id');
      const notifications = volunteers.map(v => ({
        user: v._id,
        type: 'DONATION_REJECTED',
        title: 'Donation Rejected',
        message: `${ngoName} rejected donation "${donation.food_type}". Volunteers, please review available donations.`,
        related_entity_id: donation._id,
        related_entity_type: 'Donation',
        metadata: { donationId: donation._id, ngoId: ngoUserId }
      }));

      if (Notification && notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {
      console.error('Notification creation error (reject):', notifErr);
    }

    res.json({ success: true, message: 'Donation rejected (volunteers notified)' });
  } catch (error) {
    console.error('Reject donation error:', error);
    res.status(500).json({ success: false, message: 'Error rejecting donation', error: error.message });
  }
};

// Get All Donations with Filters
exports.getDonations = async (req, res) => {
  try {
    await expireStaleDonations();

    const { city, status, food_category, latitude, longitude, radius = 10, search, category, ngo } = req.query;

    const filter = {};
    // default behaviour in original code filtered status AVAILABLE
    filter.status = status || 'AVAILABLE';

    // map incoming aliases
    const resolvedCategory = category || food_category;
    if (city) filter.city = city;
    if (resolvedCategory) filter.food_category = resolvedCategory;

    // Query DB (populate donor basic info); we'll also consider NGO ownership below
    let donations = await Donation.find(filter)
      .populate({ path: 'donor', select: 'first_name last_name phone email' })
      .populate({ path: 'organization', select: 'name city state' })
      .populate({ path: 'accepted_by.user', select: 'first_name last_name email role' })
      .populate({ path: 'accepted_by.organization', select: 'name city state' })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // If the requester is an NGO, restrict visible donations to:
    // - donations assigned to this NGO (organization in orgs owned by user)
    // - unassigned donations with status AVAILABLE (so NGOs can browse unassigned donations)
    let orgIdsForUser = [];
    const requestingUserId = req.user && (req.user.id || req.user._id);
    if (requestingUserId && req.user.role === 'NGO') {
      try {
        const orgs = await Organization.find({ created_by: requestingUserId }).select('_id').lean();
        orgIdsForUser = orgs.map(o => o._id.toString());
      } catch (orgErr) {
        console.warn('Error finding organizations for NGO user:', orgErr);
      }
    }

    // If lat/lon provided filter by radius (Haversine in JS)
    let filteredDonations = donations;
    if (latitude && longitude) {
      const latNum = parseFloat(latitude);
      const lonNum = parseFloat(longitude);
      const radKm = parseFloat(radius);

      filteredDonations = donations.filter(donation => {
        // ensure donation has coordinates
        const dLat = parseFloat(donation.location_latitude);
        const dLon = parseFloat(donation.location_longitude);
        if (Number.isNaN(dLat) || Number.isNaN(dLon)) return false;

        const distance = calculateDistance(latNum, lonNum, dLat, dLon);
        return distance <= radKm;
      });
    }

    // Apply search text filter (on food_name, food_type, description)
    if (search) {
      const q = search.trim().toLowerCase();
      donations = donations.filter(d => {
        const fields = [d.food_name, d.food_type, d.food_category, d.description]
          .filter(Boolean)
          .map(v => String(v).toLowerCase());
        return fields.some(v => v.includes(q));
      });
    }

    // Filter by NGO name if provided
    if (ngo) {
      const q = ngo.trim().toLowerCase();
      donations = donations.filter(d => {
        const org = d.organization || d.accepted_by?.organization;
        if (!org) return false;
        const name = (org.name || '').toLowerCase();
        return name.includes(q);
      });
    }

    // Apply NGO scoping: if user is NGO, show only donations either unassigned (organization == null)
    // or assigned to one of their organizations. This prevents NGOs seeing donations assigned to other orgs.
    if (requestingUserId && req.user.role === 'NGO') {
      filteredDonations = filteredDonations.filter(donation => {
        // hide donations this NGO already rejected
        const rej = donation?.accepted_by?.rejected;
        const rejUser = donation?.accepted_by?.user;
        const rejUserId = rejUser?._id ? rejUser._id.toString() : rejUser ? rejUser.toString() : null;
        if (rej && rejUserId && rejUserId === requestingUserId.toString()) return false;

        const orgRef = donation.organization;
        if (!orgRef) return donation.status === 'AVAILABLE';
        try {
          const orgIdStr = orgRef._id ? orgRef._id.toString() : orgRef.toString();
          return orgIdsForUser.includes(orgIdStr);
        } catch (e) {
          return false;
        }
      });
    }

    res.json({
      success: true,
      count: filteredDonations.length,
      donations: filteredDonations
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donations',
      error: error.message
    });
  }
};

// Get Single Donation by UUID
exports.getDonationById = async (req, res) => {
  try {
    const { id } = req.params;

    await expireStaleDonations();

    let donation = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      donation = await Donation.findById(id)
        .populate({ path: 'donor', select: 'first_name last_name phone email profile_image_url' })
        .lean();
    }
    if (!donation) {
      donation = await Donation.findOne({ uuid: id })
        .populate({ path: 'donor', select: 'first_name last_name phone email profile_image_url' })
        .lean();
    }

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.json({
      success: true,
      donation
    });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donation',
      error: error.message
    });
  }
};

// Update Donation
exports.updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const donation = await Donation.findOne({ uuid: id });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    const donorId = req.user && (req.user.id || req.user._id);
    if (!donorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // check ownership (donor is ObjectId)
    if (donation.donor.toString() !== donorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation'
      });
    }

    // If new image file uploaded
    if (req.file) {
      updates.image_url = `/uploads/${req.file.filename}`;
    }

    // apply updates
    const updatedDonation = await Donation.findByIdAndUpdate(donation._id, updates, { new: true });

    res.json({
      success: true,
      message: 'Donation updated successfully',
      donation: updatedDonation
    });
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating donation',
      error: error.message
    });
  }
};

// Cancel Donation (set status = CANCELLED)
exports.cancelDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findOne({ uuid: id });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    const donorId = req.user && (req.user.id || req.user._id);
    if (!donorId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (donation.donor.toString() !== donorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this donation'
      });
    }

    donation.status = 'CANCELLED';
    await donation.save();

    res.json({
      success: true,
      message: 'Donation cancelled successfully',
      donation
    });
  } catch (error) {
    console.error('Cancel donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling donation',
      error: error.message
    });
  }
};

// Helper function to calculate distance between two coordinates (in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get donation history/activity log
exports.getDonationHistory = async (req, res) => {
  try {
    const { donationId } = req.params;
    const ActivityLog = require('../models/ActivityLog');

    const history = await ActivityLog.find({ donation: donationId })
      .populate('user', 'first_name last_name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (error) {
    console.error('Error fetching donation history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get user activity (donations created, accepted, rejected, etc.)
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const ActivityLog = require('../models/ActivityLog');

    const activities = await ActivityLog.find({ user: userId })
      .populate('donation', 'food_type quantity status donor')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get history of donations based on user role
exports.getMyDonationHistory = async (req, res) => {
  try {
    await expireStaleDonations();

    const userId = req.user && (req.user.id || req.user._id);
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    console.log(`Fetching history for user: ${userId}, role: ${userRole}`);

    let historyDonations = [];

    if (userRole === 'DONOR') {
      // Donors see all their created donations (regardless of status)
      historyDonations = await Donation.find({ donor: userId })
        .populate('accepted_by.user', 'first_name last_name email role')
        .populate('accepted_by.organization', 'name address city state phone email average_rating acceptance_score rating_count accepted_count decision_count')
        .populate('organization', 'name city average_rating acceptance_score rating_count accepted_count decision_count')
        .sort({ createdAt: -1 });
    } else if (userRole === 'NGO') {
      // NGOs see donations they accepted (status: ALLOCATED, PICKED_UP, COMPLETED)
      historyDonations = await Donation.find({
        'accepted_by.user': userId,
        'accepted_by.role': 'NGO',
        status: { $in: ['ALLOCATED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'] }
      })
        .populate('donor', 'first_name last_name email phone')
        .populate('organization', 'name city average_rating acceptance_score rating_count accepted_count decision_count')
        .sort({ createdAt: -1 });
    } else if (userRole === 'VOLUNTEER') {
      // Volunteers see donations they accepted directly AND pickup requests they created
      
      // 1. Get donations accepted by this volunteer
      const acceptedDonations = await Donation.find({
        'accepted_by.user': userId,
        'accepted_by.role': 'VOLUNTEER',
        status: { $in: ['ALLOCATED', 'PICKED_UP', 'COMPLETED', 'CANCELLED'] }
      })
        .populate('donor', 'first_name last_name email phone')
        .populate('organization', 'name city')
        .sort({ createdAt: -1 })
        .lean();
      
      console.log(`Volunteer ${userId} accepted donations:`, acceptedDonations.length);
      
      // 2. Get pickup requests they created
      const PickupRequest = require('../models/PickupRequest');
      const pickups = await PickupRequest.find({ volunteer: userId })
        .populate({
          path: 'donation',
          populate: [
            { path: 'donor', select: 'first_name last_name email phone' },
            { path: 'organization', select: 'name city' }
          ]
        })
        .sort({ createdAt: -1 });
      
      console.log(`Volunteer ${userId} pickup requests:`, pickups.length);
      
      // Transform pickup requests to donation format
      const pickupDonations = pickups.map(pickup => ({
        ...pickup.donation?.toObject(),
        pickup_status: pickup.status,
        pickup_id: pickup._id,
        requested_quantity: pickup.requested_quantity,
        isPickupRequest: true
      }));
      
      // Combine both lists (accepted donations + pickup requests)
      historyDonations = [...acceptedDonations, ...pickupDonations];
      
      // Sort by createdAt descending
      historyDonations.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0);
        const dateB = new Date(b.createdAt || b.updatedAt || 0);
        return dateB - dateA;
      });
    }

    res.json({
      success: true,
      count: historyDonations.length,
      history: historyDonations
    });
  } catch (error) {
    console.error('Error fetching donation history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donation history',
      error: error.message
    });
  }
};

module.exports.calculateDistance = calculateDistance;

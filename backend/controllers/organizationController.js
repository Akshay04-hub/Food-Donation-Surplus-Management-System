const Organization = require('../models/Organization');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail, generateEmailTemplate } = require('../utils/emailUtils');

// Create Organization
exports.createOrganization = async (req, res) => {
  try {
    const {
      name,
      organization_type,
      description,
      registration_number,
      website,
      email,
      phone,
      location_latitude,
      location_longitude,
      address,
      city,
      state,
      zip_code
    } = req.body;

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ email });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'Organization with this email already exists'
      });
    }

    // Create organization
    const organization = new Organization({
      name,
      organization_type,
      description,
      registration_number,
      website,
      email,
      phone,
      location_latitude,
      location_longitude,
      address,
      city,
      state,
      zip_code,
      verification_status: 'PENDING',
      is_active: true,
      created_by: req.user._id || req.user.id,
      registration_document_url: req.file ? `/uploads/${req.file.filename}` : null
    });
    await organization.save();

    // Notify all admins about the new NGO pending verification
    try {
      const admins = await User.find({ role: 'ADMIN' });
      if (admins && admins.length > 0) {
        for (const admin of admins) {
          await Notification.create({
            user: admin._id,
            type: 'NGO_PENDING_APPROVAL',
            title: `New ${organization_type} Pending Verification`,
            message: `${organization.name} (${organization_type}) has been created and is pending your approval.`,
            related_entity_id: organization._id,
            related_entity_type: 'ORGANIZATION',
            metadata: { organizationId: organization._id, organizationName: organization.name, organizationType: organization_type }
          });
        }
      }
    } catch (notifyErr) {
      console.error('Error notifying admins (non-fatal):', notifyErr);
    }

    // Send email to NGO creator acknowledging creation
    try {
      await sendEmail(
        email,
        'Organization Created - Pending Verification',
        generateEmailTemplate('org_created', { org_name: organization.name })
      ).catch(err => console.error('Email error (non-fatal):', err));
    } catch (emailErr) {
      console.error('Email error (non-fatal):', emailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Organization created and pending verification. Admin will review shortly.',
      organization
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating organization',
      error: error.message
    });
  }
};

// Get All Organizations
exports.getOrganizations = async (req, res) => {
  try {
    const { verification_status, organization_type, city } = req.query;

    let whereClause = { is_active: true };

    if (verification_status) {
      whereClause.verification_status = verification_status;
    }

    if (organization_type) {
      whereClause.organization_type = organization_type;
    }

    if (city) {
      whereClause.city = city;
    }

    const organizations = await Organization.find(whereClause)
      .populate('creator', 'first_name last_name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: organizations.length,
      organizations
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organizations',
      error: error.message
    });
  }
};

// Get Organization by ID
exports.getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findOne({ uuid: id })
      .populate('created_by', 'first_name last_name email');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      organization
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organization',
      error: error.message
    });
  }
};

// Approve Organization (Admin only)
exports.approveOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find by _id first, then by uuid
    const organization = await Organization.findOne({ 
      $or: [
        { _id: id },
        { uuid: id }
      ]
    });
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    organization.verification_status = 'APPROVED';
    organization.verified_by = req.user._id || req.user.id;
    organization.verified_date = new Date();
    await organization.save();

    // Send approval email
    await sendEmail(
      organization.email,
      'Organization Approved',
      generateEmailTemplate('organization_approved', { org_name: organization.name })
    );

    // Create notification
    await Notification.create({
      user: organization.created_by,
      type: 'ORGANIZATION_APPROVED',
      title: 'Organization Approved',
      message: `${organization.name} has been approved and verified`,
      related_entity_id: organization._id,
      related_entity_type: 'ORGANIZATION'
    });

    res.json({
      success: true,
      message: 'Organization approved',
      organization
    });
  } catch (error) {
    console.error('Approve organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving organization',
      error: error.message
    });
  }
};

// Reject Organization (Admin only)
exports.rejectOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    // Try to find by _id first, then by uuid
    const organization = await Organization.findOne({ 
      $or: [
        { _id: id },
        { uuid: id }
      ]
    });
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    organization.verification_status = 'REJECTED';
    organization.verified_by = req.user._id || req.user.id;
    organization.verified_date = new Date();
    await organization.save();

    // Create notification
    await Notification.create({
      user: organization.created_by,
      type: 'ORGANIZATION_REJECTED',
      title: 'Organization Rejected',
      message: `${organization.name} registration has been rejected`,
      related_entity_id: organization._id,
      related_entity_type: 'ORGANIZATION'
    });

    res.json({
      success: true,
      message: 'Organization rejected',
      organization
    });
  } catch (error) {
    console.error('Reject organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting organization',
      error: error.message
    });
  }
};

// Update Organization
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const organization = await Organization.findOne({ uuid: id });
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Verify ownership (compare ObjectIds properly)
    const userId = req.user._id || req.user.id;
    if (organization.created_by.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this organization'
      });
    }

    Object.assign(organization, updates);
    await organization.save();

    res.json({
      success: true,
      message: 'Organization updated',
      organization
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating organization',
      error: error.message
    });
  }
};

// Rate Organization
exports.rateOrganization = async (req, res) => {
  try {
    const { id } = req.params; // uuid
    const userId = req.user && (req.user.id || req.user._id);
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { rating, comment } = req.body;
    const numericRating = Number(rating || 0);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const organization = await Organization.findOne({ uuid: id });
    if (!organization) return res.status(404).json({ success: false, message: 'Organization not found' });

    // If user already rated, update that rating
    const existingIndex = organization.ratings.findIndex(r => r.user && r.user.toString() === userId.toString());
    if (existingIndex >= 0) {
      // replace rating
      organization.ratings[existingIndex].rating = numericRating;
      if (comment) organization.ratings[existingIndex].comment = comment;
    } else {
      organization.ratings.push({ user: userId, rating: numericRating, comment });
    }

    // Recalculate average and count
    organization.rating_count = organization.ratings.length;
    const sum = organization.ratings.reduce((s, r) => s + (r.rating || 0), 0);
    organization.average_rating = organization.rating_count ? (sum / organization.rating_count) : 0;

    await organization.save();

    res.json({ success: true, message: 'Rating saved', organization: { uuid: organization.uuid, average_rating: organization.average_rating, rating_count: organization.rating_count } });
  } catch (error) {
    console.error('Rate organization error:', error);
    res.status(500).json({ success: false, message: 'Error saving rating', error: error.message });
  }
};

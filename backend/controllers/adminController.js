const User = require('../models/User');
const Donation = require('../models/Donation');
const PickupRequest = require('../models/PickupRequest');
const ActivityLog = require('../models/ActivityLog');
const Organization = require('../models/Organization');

// Helpers
const ensureAdmin = (user) => {
  if (!user || user.role !== 'ADMIN') {
    const err = new Error('Access denied. Admin only.');
    err.statusCode = 403;
    throw err;
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    ensureAdmin(req.user);

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching users' 
    });
  }
};

// Get all donations
exports.getAllDonations = async (req, res) => {
  try {
    ensureAdmin(req.user);

    const donations = await Donation.find()
      .populate('donor', 'first_name last_name email')
      .populate('organization', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const mapped = donations.map((d) => {
      const donorName = `${d.donor?.first_name || ''} ${d.donor?.last_name || ''}`.trim() || 'Donor';
      const ngoName = d.organization?.name || '—';

      return {
        donation_id: d._id,
        food_type: d.food_type,
        quantity: d.quantity,
        unit: d.unit,
        donor_name: donorName,
        ngo_name: ngoName,
        status: d.status,
        pickup_address: d.address,
        created_at: d.createdAt,
      };
    });

    res.json({
      success: true,
      donations: mapped
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching donations' 
    });
  }
};

// Get all pickup requests
exports.getAllPickups = async (req, res) => {
  try {
    ensureAdmin(req.user);

    const pickups = await PickupRequest.find()
      .populate('receiver', 'first_name last_name organization_name email role')
      .populate('donation', 'food_type quantity unit')
      .sort({ request_date: -1 })
      .lean();

    // normalize volunteer info (use receiver if they are volunteer)
    const mapped = pickups.map((p) => {
      const volunteer = p.receiver && p.receiver.role === 'VOLUNTEER' ? p.receiver : null;
      return { ...p, volunteer };
    });

    res.json({
      success: true,
      pickups: mapped
    });
  } catch (error) {
    console.error('Error fetching pickups:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching pickups' 
    });
  }
};

// Get NGO activity with percentage of completed donations
exports.getNGOActivity = async (req, res) => {
  try {
    ensureAdmin(req.user);

    // Fetch all NGOs (for admin dashboard visibility)
    const ngos = await Organization.find({ 
      organization_type: 'NGO'
    })
      .select('_id uuid name city state email verification_status is_active acceptance_score accepted_count decision_count created_by createdAt')
      .lean();

    // Aggregate donation stats per NGO
    const donationStats = await Donation.aggregate([
      { $match: { organization: { $ne: null } } },
      {
        $group: {
          _id: '$organization',
          totalDonations: { $sum: 1 },
          completedDonations: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
          }
        }
      }
    ]);

    const statsMap = donationStats.reduce((acc, item) => {
      acc[item._id?.toString()] = item;
      return acc;
    }, {});

    const result = ngos.map((ngo) => {
      const stat = statsMap[ngo._id.toString()] || {};
      const total = stat.totalDonations || ngo.decision_count || 0;
      const completed = stat.completedDonations || ngo.accepted_count || 0;
      const activityPercentage = total > 0 ? Math.round((completed / total) * 100) : (ngo.acceptance_score || 0);

      return {
        _id: ngo._id,
        uuid: ngo.uuid,
        id: ngo._id,
        name: ngo.name,
        city: ngo.city,
        state: ngo.state,
        email: ngo.email,
        verification_status: ngo.verification_status || 'PENDING',
        is_active: ngo.is_active,
        totalDonations: total,
        completedDonations: completed,
        activityPercentage,
        acceptance_score: ngo.acceptance_score || 0,
        accepted_count: ngo.accepted_count || 0,
        decision_count: ngo.decision_count || 0,
        created_by: ngo.created_by,
        createdAt: ngo.createdAt
      };
    }).sort((a, b) => b.activityPercentage - a.activityPercentage);

    res.json({ success: true, ngos: result });
  } catch (error) {
    console.error('Error fetching NGO activity:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Error fetching NGO activity'
    });
  }
};

// Get donor activity with donation completion percentage
exports.getDonorActivity = async (req, res) => {
  try {
    ensureAdmin(req.user);

    // Fetch donors
    const donors = await User.find({ role: 'DONOR' })
      .select('first_name last_name email city state is_active createdAt')
      .lean();

    // Aggregate donation stats per donor
    const donationStats = await Donation.aggregate([
      { $match: { donor: { $ne: null } } },
      {
        $group: {
          _id: '$donor',
          totalDonations: { $sum: 1 },
          completedDonations: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
          }
        }
      }
    ]);

    const statsMap = donationStats.reduce((acc, item) => {
      acc[item._id?.toString()] = item;
      return acc;
    }, {});

    const result = donors.map((donor) => {
      const stat = statsMap[donor._id.toString()] || {};
      const total = stat.totalDonations || 0;
      const completed = stat.completedDonations || 0;
      const activityPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: donor._id,
        name: `${donor.first_name || ''} ${donor.last_name || ''}`.trim(),
        email: donor.email,
        city: donor.city,
        state: donor.state,
        is_active: donor.is_active,
        totalDonations: total,
        completedDonations: completed,
        activityPercentage,
        createdAt: donor.createdAt
      };
    }).sort((a, b) => b.totalDonations - a.totalDonations);

    res.json({ success: true, donors: result });
  } catch (error) {
    console.error('Error fetching donor activity:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Error fetching donor activity'
    });
  }
};

// Get volunteer activity with pickup completion percentage
exports.getVolunteerActivity = async (req, res) => {
  try {
    ensureAdmin(req.user);

    // Fetch volunteers
    const volunteers = await User.find({ role: 'VOLUNTEER' })
      .select('first_name last_name email city state is_active createdAt')
      .lean();

    // Aggregate pickup stats per volunteer (receiver is the volunteer)
    const pickupStats = await PickupRequest.aggregate([
      { $match: { receiver: { $ne: null } } },
      {
        $group: {
          _id: '$receiver',
          totalPickups: { $sum: 1 },
          completedPickups: {
            $sum: { $cond: [{ $eq: ['$status', 'PICKED_UP'] }, 1, 0] }
          }
        }
      }
    ]);

    const statsMap = pickupStats.reduce((acc, item) => {
      acc[item._id?.toString()] = item;
      return acc;
    }, {});

    const result = volunteers.map((volunteer) => {
      const stat = statsMap[volunteer._id.toString()] || {};
      const total = stat.totalPickups || 0;
      const completed = stat.completedPickups || 0;
      const activityPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: volunteer._id,
        name: `${volunteer.first_name || ''} ${volunteer.last_name || ''}`.trim(),
        email: volunteer.email,
        city: volunteer.city,
        state: volunteer.state,
        is_active: volunteer.is_active,
        totalPickups: total,
        completedPickups: completed,
        activityPercentage,
        createdAt: volunteer.createdAt
      };
    }).sort((a, b) => b.totalPickups - a.totalPickups);

    res.json({ success: true, volunteers: result });
  } catch (error) {
    console.error('Error fetching volunteer activity:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Error fetching volunteer activity'
    });
  }
};

// Get admin statistics
exports.getAdminStats = async (req, res) => {
  try {
    ensureAdmin(req.user);

    const [
      totalUsers,
      totalDonors,
      totalNGOs,
      totalVolunteers,
      totalDonations,
      totalPickups,
      completedDonations,
      completedPickups,
      totalPoints
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'DONOR' }),
      User.countDocuments({ role: 'NGO' }),
      User.countDocuments({ role: 'VOLUNTEER' }),
      Donation.countDocuments(),
      PickupRequest.countDocuments(),
      Donation.countDocuments({ status: 'COMPLETED' }),
      PickupRequest.countDocuments({ status: 'COMPLETED' }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$redeemable_points' } } }])
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDonors,
        totalNGOs,
        totalVolunteers,
        totalDonations,
        totalPickups,
        completedDonations,
        completedPickups,
        totalPoints: totalPoints[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(error.statusCode || 500).json({ 
      success: false,
      message: error.statusCode ? error.message : 'Error fetching statistics' 
    });
  }
};

// Get recent activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const logs = await ActivityLog.find()
      .populate('user_id', 'first_name last_name email role')
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);

    const totalLogs = await ActivityLog.countDocuments();

    res.json({
      success: true,
      logs: logs,
      total: totalLogs,
      hasMore: skip + limit < totalLogs
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching activity logs' 
    });
  }
};

// Update user status (activate/deactivate)
exports.updateUserStatus = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { userId } = req.params;
    const { is_active } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { is_active },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Log the activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: is_active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      details: `Admin ${is_active ? 'activated' : 'deactivated'} user ${user.email}`
    });

    res.json({
      success: true,
      user: user,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating user status' 
    });
  }
};

// Delete user (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete your own account' 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        is_active: false,
        deleted_at: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Log the activity
    await ActivityLog.create({
      user_id: req.user.id,
      action: 'USER_DELETED',
      details: `Admin deleted user ${user.email}`
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting user' 
    });
  }
};

module.exports = exports;

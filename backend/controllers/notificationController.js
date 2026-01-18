// backend/controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User'); // keep if you need to populate user info

// Helper: normalize user id for comparison (handles ObjectId or primitive)
const normalizeId = (id) => {
  if (!id) return id;
  // if it's an object with toString (ObjectId), return string form
  return typeof id === 'object' && id.toString ? id.toString() : String(id);
};

// Get Notifications
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly = 'false' } = req.query;

    const userId = normalizeId(req.user._id ?? req.user.id);

    const filter = { user: userId };
    if (unreadOnly === 'true') filter.is_read = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })             // newest first
      .limit(parseInt(limit, 10))
      .lean()
      .exec();

    res.json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Mark Notification as Read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params; // uuid of notification

    // Find by uuid
    const notification = await Notification.findOne({ uuid: id }).exec();
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const notifUserId = normalizeId(notification.user);
    const reqUserId = normalizeId(req.user._id ?? req.user.id);

    if (notifUserId !== reqUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this notification'
      });
    }

    // mark read
    notification.is_read = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification',
      error: error.message
    });
  }
};

// Mark All as Read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = normalizeId(req.user._id ?? req.user.id);

    await Notification.updateMany(
      { user: userId, is_read: false },
      { $set: { is_read: true } }
    ).exec();

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications',
      error: error.message
    });
  }
};

// Get Unread Count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = normalizeId(req.user._id ?? req.user.id);

    const count = await Notification.countDocuments({
      user: userId,
      is_read: false
    }).exec();

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

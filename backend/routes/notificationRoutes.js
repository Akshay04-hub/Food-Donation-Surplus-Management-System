const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

// Get notifications
router.get('/', authMiddleware, notificationController.getNotifications);

// Mark as read
router.put('/:id/read', authMiddleware, notificationController.markAsRead);

// Mark all as read
router.put('/read/all', authMiddleware, notificationController.markAllAsRead);

// Get unread count
router.get('/unread/count', authMiddleware, notificationController.getUnreadCount);

module.exports = router;

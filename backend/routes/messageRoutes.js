const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');

// Send message
router.post('/', authMiddleware, messageController.sendMessage);

// Get message thread
router.get('/thread/:userId', authMiddleware, messageController.getMessageThread);

// Get conversations
router.get('/conversations/list', authMiddleware, messageController.getConversations);

// Get unread count
router.get('/unread/count', authMiddleware, messageController.getUnreadCount);

module.exports = router;

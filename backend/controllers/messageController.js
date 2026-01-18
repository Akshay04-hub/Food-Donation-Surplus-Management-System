const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Send Message
exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, message_text, related_donation_id, related_request_id } = req.body;

    // Verify receiver exists
    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    const message = new Message({
      sender: req.user._id || req.user.id,
      receiver: receiver_id,
      message_text,
      related_donation: related_donation_id,
      related_request: related_request_id
    });
    await message.save();

    // Create notification for receiver
    await Notification.create({
      user: receiver_id,
      type: 'NEW_MESSAGE',
      title: 'New Message',
      message: `You have received a new message`,
      related_entity_id: message._id,
      related_entity_type: 'MESSAGE'
    });

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// Get Message Thread
exports.getMessageThread = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id || req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'first_name last_name profile_image_url')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        receiver: currentUserId,
        sender: userId,
        is_read: false
      },
      {
        is_read: true,
        read_at: new Date()
      }
    );

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// Get Conversations List
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;

    // Get all conversations with most recent message first
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    res.json({
      success: true,
      conversations: messages
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message
    });
  }
};

// Get Unread Count
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const count = await Message.countDocuments({
      receiver: currentUserId,
      is_read: false
    });

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

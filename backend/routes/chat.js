const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');
const aiService = require('../services/openai');

const router = express.Router();

// Send message to AI chatbot
router.post('/ai', auth, [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('sessionId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, sessionId } = req.body;
    const userId = req.user._id;

    // Save user message
    const userMessage = new Message({
      senderId: userId,
      receiverId: null, // AI messages don't have a specific receiver
      content: message,
      messageType: 'text',
      isAIResponse: false,
      aiMetadata: {
        sessionId: sessionId || `session_${Date.now()}`
      }
    });

    await userMessage.save();

    // Get user context for AI
    const user = await User.findById(userId).select('firstName role preferences');
    const context = {
      firstName: user.firstName,
      role: user.role,
      sessionId: sessionId
    };

    // Generate AI response
    const aiResponse = await aiService.generateChatResponse(message, context);

    // Save AI response
    const aiMessage = new Message({
      senderId: null, // AI doesn't have a user ID
      receiverId: userId,
      content: aiResponse.content,
      messageType: 'text',
      isAIResponse: true,
      aiMetadata: {
        confidence: aiResponse.confidence,
        sessionId: sessionId || `session_${Date.now()}`,
        intent: 'support'
      }
    });

    await aiMessage.save();

    res.json({
      userMessage: {
        id: userMessage._id,
        content: userMessage.content,
        timestamp: userMessage.createdAt,
        sender: 'user'
      },
      aiMessage: {
        id: aiMessage._id,
        content: aiMessage.content,
        timestamp: aiMessage.createdAt,
        sender: 'ai',
        confidence: aiResponse.confidence
      }
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ message: 'Failed to process AI chat', error: error.message });
  }
});

// Get chat history with AI
router.get('/ai/history', auth, async (req, res) => {
  try {
    const { sessionId, limit = 50 } = req.query;
    const userId = req.user._id;

    let query = {
      $or: [
        { senderId: userId, isAIResponse: false },
        { receiverId: userId, isAIResponse: true }
      ]
    };

    if (sessionId) {
      query['aiMetadata.sessionId'] = sessionId;
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('content createdAt isAIResponse aiMetadata');

    const formattedMessages = messages.reverse().map(msg => ({
      id: msg._id,
      content: msg.content,
      timestamp: msg.createdAt,
      sender: msg.isAIResponse ? 'ai' : 'user',
      confidence: msg.aiMetadata?.confidence,
      sessionId: msg.aiMetadata?.sessionId
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send message to therapist
router.post('/message', auth, [
  body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('messageType').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, content, messageType = 'text' } = req.body;
    const senderId = req.user._id;

    // Verify recipient exists and is active
    const recipient = await User.findOne({ _id: recipientId, isActive: true });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create message
    const message = new Message({
      senderId,
      receiverId: recipientId,
      content,
      messageType,
      isRead: false
    });

    await message.save();

    // Populate sender info for response
    await message.populate('senderId', 'firstName lastName avatar');

    // Emit real-time message via Socket.IO (if available)
    if (req.app.get('io')) {
      req.app.get('io').to(recipientId.toString()).emit('newMessage', {
        id: message._id,
        content: message.content,
        sender: {
          id: message.senderId._id,
          firstName: message.senderId.firstName,
          lastName: message.senderId.lastName,
          avatar: message.senderId.avatar
        },
        timestamp: message.createdAt,
        messageType: message.messageType
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: {
        id: message._id,
        content: message.content,
        timestamp: message.createdAt,
        messageType: message.messageType
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get conversation with specific user
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ],
      isDeleted: false
    })
      .populate('senderId', 'firstName lastName avatar')
      .populate('receiverId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mark messages as read
    await Message.updateMany(
      {
        senderId: userId,
        receiverId: currentUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    const formattedMessages = messages.reverse().map(msg => ({
      id: msg._id,
      content: msg.content,
      sender: {
        id: msg.senderId._id,
        firstName: msg.senderId.firstName,
        lastName: msg.senderId.lastName,
        avatar: msg.senderId.avatar
      },
      timestamp: msg.createdAt,
      messageType: msg.messageType,
      isRead: msg.isRead
    }));

    res.json(formattedMessages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
          isDeleted: false,
          isAIResponse: false
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', userId] },
              '$receiverId',
              '$senderId'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiverId', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'participant'
        }
      },
      {
        $unwind: '$participant'
      },
      {
        $project: {
          participant: {
            id: '$participant._id',
            firstName: '$participant.firstName',
            lastName: '$participant.lastName',
            avatar: '$participant.avatar',
            role: '$participant.role'
          },
          lastMessage: {
            content: '$lastMessage.content',
            timestamp: '$lastMessage.createdAt',
            senderId: '$lastMessage.senderId'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark messages as read
router.put('/read/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      {
        senderId: conversationId,
        receiverId: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      senderId: userId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    message.isDeleted = true;
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
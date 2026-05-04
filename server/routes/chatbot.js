const express = require('express');
const router = express.Router();
const chatbotService = require('../services/ChatbotService');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/chatbot/message
 * @desc    Process a chatbot message
 * @access  Private
 */
router.post('/message', auth, async (req, res) => {
  const { message, context } = req.body;
  const userId = req.user.id;

  console.log(`[Chatbot] Request from user ${userId}: "${message}"`);

  if (!message) {
    return res.status(400).json({ msg: 'Message is required' });
  }

  try {
    const response = await chatbotService.processMessage(message, context);
    console.log(`[Chatbot] Response for user ${userId}: "${response.text.substring(0, 50)}..."`);
    res.json(response);
  } catch (err) {
    console.error(`[Chatbot Error] User ${userId}:`, err);
    res.status(500).json({ 
      msg: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;

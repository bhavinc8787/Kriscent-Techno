const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const { createMessage } = require('../validation/schemas');

// Send message
router.post('/', auth, async (req, res) => {
  const { error, value } = createMessage.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const message = await Message.create({ ...value, senderId: req.user._id, timestamp: new Date() });
  // Emit via socket.io if available
  try {
    const io = req.app.get('io');
    if (io) io.to(`team_${message.teamId}`).emit('message', message);
  } catch (e) {
    console.warn('Socket emit failed', e);
  }
  res.status(201).json(message);
});

// Get team messages
router.get('/', auth, async (req, res) => {
  const teamId = req.user.teamId || req.query.teamId;
  if (!teamId) return res.status(400).json({ message: 'teamId required' });
  const messages = await Message.find({ teamId }).sort({ timestamp: 1 });
  res.json(messages);
});

module.exports = router;

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  timestamp: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);

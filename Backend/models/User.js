const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'MANAGER', 'MEMBER'], default: 'MEMBER' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roles');
const User = require('../models/User');

// Get current user
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-__v');
  res.json(user);
});

// Admin: update user role
router.put('/:id/role', auth, checkRole('ADMIN'), async (req, res) => {
  const { role } = req.body;
  if (!['ADMIN','MANAGER','MEMBER'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

module.exports = router;

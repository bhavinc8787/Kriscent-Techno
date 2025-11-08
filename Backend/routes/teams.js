const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roles');
const Team = require('../models/Team');
const User = require('../models/User');

// Create a team - creator becomes admin of the team
router.post('/', auth, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  const team = await Team.create({ name, description, adminId: req.user._id });
  // set user's teamId and make them admin
  req.user.teamId = team._id;
  req.user.role = 'ADMIN';
  await req.user.save();
  res.status(201).json(team);
});

// Admin: add user to team by email and set role
router.post('/:id/addUser', auth, checkRole('ADMIN'), async (req, res) => {
  const { email, role } = req.body;
  if (!email) return res.status(400).json({ message: 'email required' });
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: 'Team not found' });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.teamId = team._id;
  if (role && ['ADMIN','MANAGER','MEMBER'].includes(role)) user.role = role;
  await user.save();
  res.json(user);
});

module.exports = router;

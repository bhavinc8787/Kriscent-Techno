const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roles');
const { createProject, updateProject } = require('../validation/schemas');

// Get all projects for user's team
router.get('/', auth, async (req, res) => {
  const teamId = req.user.teamId;
  const projects = await Project.find({ teamId });
  res.json(projects);
});

// Create project (Admin/Manager)
router.post('/', auth, checkRole(['ADMIN','MANAGER']), async (req, res) => {
  const { error, value } = createProject.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const project = await Project.create({ ...value, teamId: req.user.teamId });
  res.status(201).json(project);
});

// Update project (Admin/Manager)
router.put('/:id', auth, checkRole(['ADMIN','MANAGER']), async (req, res) => {
  const { error, value } = updateProject.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const project = await Project.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!project) return res.status(404).json({ message: 'Not found' });
  res.json(project);
});

// Delete project (Admin only)
router.delete('/:id', auth, checkRole('ADMIN'), async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;

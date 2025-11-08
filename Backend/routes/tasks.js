const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roles');
const { createTask, updateTask } = require('../validation/schemas');

// Get all tasks for a project (projectId passed as query)
router.get('/', auth, async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ message: 'projectId required' });
  const tasks = await Task.find({ projectId });
  res.json(tasks);
});

// Create task
router.post('/', auth, async (req, res) => {
  const { error, value } = createTask.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  // If assigning on creation, require MANAGER/ADMIN
  if (value.assignedTo && !['ADMIN', 'MANAGER'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Only MANAGER or ADMIN can assign tasks' });
  }
  const task = await Task.create(value);
  res.status(201).json(task);
});

// Update task (status/assignee) - Manager/Admin only
router.put('/:id', auth, checkRole(['ADMIN','MANAGER']), async (req, res) => {
  const { error, value } = updateTask.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const task = await Task.findByIdAndUpdate(req.params.id, value, { new: true });
  if (!task) return res.status(404).json({ message: 'Not found' });
  res.json(task);
});

// Delete task - Manager/Admin only
router.delete('/:id', auth, checkRole(['ADMIN','MANAGER']), async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;

const Joi = require('joi');

const createProject = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().allow('', null)
});

const updateProject = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().allow('', null)
});

const createTask = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().allow('', null),
  projectId: Joi.string().required(),
  assignedTo: Joi.string().allow(null)
});

const updateTask = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('todo', 'in-progress', 'done'),
  assignedTo: Joi.string().allow(null)
});

const createMessage = Joi.object({
  content: Joi.string().trim().required(),
  teamId: Joi.string().required()
});

module.exports = { createProject, updateProject, createTask, updateTask, createMessage };

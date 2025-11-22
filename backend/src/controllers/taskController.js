import Joi from 'joi';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/errors.js';

const taskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  staff_id: Joi.number().allow(null),
  status: Joi.string().valid('pending', 'in_progress', 'done').required(),
});

export const listTasks = async (req, res) => {
  const tasks = await Task.list();
  res.json({ tasks });
};

export const myTasks = async (req, res) => {
  const tasks = await Task.list({ staff_id: req.user.id });
  res.json({ tasks });
};

export const createTask = async (req, res, next) => {
  const { error, value } = taskSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const task = await Task.create(value);
  res.status(201).json({ task });
};

export const updateTask = async (req, res, next) => {
  const { error, value } = taskSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const task = await Task.update(req.params.id, value);
  if (!task) return next(new ApiError(404, 'Task not found'));
  res.json({ task });
};

import Joi from 'joi';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/errors.js';

const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  staff_id: Joi.number().allow(null),
  vendor_id: Joi.number().allow(null),
  booking_id: Joi.number().allow(null),
  room_id: Joi.number().allow(null),
  department: Joi.string().allow('', null),
  task_type: Joi.string().allow('', null),
  priority: Joi.string().valid('low', 'normal', 'high').default('normal'),
  status: Joi.string().valid('pending', 'in_progress', 'done').required(),
  due_date: Joi.date().allow(null),
  request_id: Joi.number().allow(null),
});

const updateTaskSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string().allow('', null),
  staff_id: Joi.number().allow(null),
  vendor_id: Joi.number().allow(null),
  department: Joi.string().allow('', null),
  task_type: Joi.string().allow('', null),
  priority: Joi.string().valid('low', 'normal', 'high'),
  status: Joi.string().valid('pending', 'in_progress', 'done'),
  due_date: Joi.date().allow(null),
}).min(1);

export const listTasks = async (req, res) => {
  const filters = {
    department: req.query.department,
    status: req.query.status,
  };
  const tasks = await Task.list(filters);
  res.json({ tasks });
};

export const myTasks = async (req, res) => {
  const tasks = await Task.list({ staff_id: req.user.id });
  res.json({ tasks });
};

export const createTask = async (req, res, next) => {
  const { error, value } = createTaskSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const task = await Task.create(value);
  res.status(201).json({ task });
};

export const updateTask = async (req, res, next) => {
  const { error, value } = updateTaskSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const task = await Task.update(req.params.id, value);
  if (!task) return next(new ApiError(404, 'Task not found'));
  res.json({ task });
};

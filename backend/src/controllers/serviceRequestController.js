import Joi from 'joi';
import { ServiceRequest } from '../models/ServiceRequest.js';
import { Booking } from '../models/Booking.js';
import { ApiError } from '../utils/errors.js';
import { Task } from '../models/Task.js';

const requestTypes = ['spa', 'pickup', 'gym', 'tour', 'meeting', 'concierge', 'other'];

const createSchema = Joi.object({
  booking_id: Joi.number().required(),
  type: Joi.string()
    .valid(...requestTypes)
    .required(),
  details: Joi.string().allow('', null),
  preferred_time: Joi.date().allow(null),
});

const updateSchema = Joi.object({
  status: Joi.string().valid('pending', 'scheduled', 'in_progress', 'completed', 'cancelled'),
  assigned_staff_id: Joi.number().allow(null),
  notes: Joi.string().allow('', null),
}).min(1);

const departmentMap = {
  spa: 'spa',
  pickup: 'transport',
  tour: 'concierge',
  meeting: 'concierge',
  gym: 'wellness',
  concierge: 'concierge',
  other: 'guest_services',
};

const createTaskForRequest = (request) =>
  Task.create({
    title: `Handle ${request.type} request`,
    description: request.details,
    booking_id: request.booking_id,
    request_id: request.id,
    department: departmentMap[request.type] || 'guest_services',
    task_type: 'service_request',
    priority: 'normal',
    status: 'pending',
    due_date: request.preferred_time,
  });

export const listRequests = async (req, res) => {
  const requests = await ServiceRequest.list(req.query);
  res.json({ requests });
};

export const myRequests = async (req, res) => {
  const requests = await ServiceRequest.list({ user_id: req.user.id });
  res.json({ requests });
};

export const createRequest = async (req, res, next) => {
  const { error, value } = createSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));

  const booking = await Booking.findById(value.booking_id);
  if (!booking || booking.user_id !== req.user.id) {
    return next(new ApiError(404, 'Booking not found'));
  }
  if (booking.status !== 'confirmed') {
    return next(new ApiError(400, 'Requests can only be filed for confirmed bookings'));
  }

  const request = await ServiceRequest.create({
    ...value,
    user_id: req.user.id,
    status: 'pending',
  });
  await createTaskForRequest(request);
  res.status(201).json({ request });
};

export const updateRequest = async (req, res, next) => {
  const { error, value } = updateSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const request = await ServiceRequest.update(req.params.id, value);
  if (!request) return next(new ApiError(404, 'Request not found'));
  res.json({ request });
};

import Joi from 'joi';
import { Room } from '../models/Room.js';
import { ApiError } from '../utils/errors.js';

const roomSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().allow('', null),
  price: Joi.number().min(0).required(),
  status: Joi.string().valid('available', 'occupied', 'maintenance').required(),
  description: Joi.string().allow('', null),
});

export const listRooms = async (req, res) => {
  const rooms = await Room.list(req.query);
  res.json({ rooms });
};

export const createRoom = async (req, res, next) => {
  const { error, value } = roomSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const room = await Room.create(value);
  res.status(201).json({ room });
};

export const updateRoom = async (req, res, next) => {
  const { error, value } = roomSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const room = await Room.update(req.params.id, value);
  if (!room) return next(new ApiError(404, 'Room not found'));
  res.json({ room });
};

export const deleteRoom = async (req, res) => {
  await Room.remove(req.params.id);
  res.status(204).end();
};

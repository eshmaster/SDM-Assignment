import Joi from 'joi';
import { Room } from '../models/Room.js';
import { ApiError } from '../utils/errors.js';

const roomSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().allow('', null),
  price: Joi.number().min(0).required(),
  capacity: Joi.number().min(1).max(8).required(),
  amenities: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().allow('', null)).default([]),
  status: Joi.string().valid('available', 'occupied', 'maintenance').required(),
  description: Joi.string().allow('', null),
});

const normalizeAmenities = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const listRooms = async (req, res) => {
  const amenities = req.query.amenities
    ? String(req.query.amenities)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const filters = {
    status: req.query.status,
    type: req.query.type,
    capacity: req.query.capacity,
    amenities,
    search: req.query.search,
    check_in: req.query.check_in,
    check_out: req.query.check_out,
  };
  const rooms =
    filters.check_in && filters.check_out ? await Room.search(filters) : await Room.list(filters);
  res.json({ rooms });
};

export const createRoom = async (req, res, next) => {
  const { error, value } = roomSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const room = await Room.create({ ...value, amenities: normalizeAmenities(value.amenities) });
  res.status(201).json({ room });
};

export const updateRoom = async (req, res, next) => {
  const { error, value } = roomSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const room = await Room.update(req.params.id, { ...value, amenities: normalizeAmenities(value.amenities) });
  if (!room) return next(new ApiError(404, 'Room not found'));
  res.json({ room });
};

export const deleteRoom = async (req, res) => {
  await Room.remove(req.params.id);
  res.status(204).end();
};

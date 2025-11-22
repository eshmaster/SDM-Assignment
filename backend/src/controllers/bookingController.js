import Joi from 'joi';
import { Booking } from '../models/Booking.js';
import { Room } from '../models/Room.js';
import { ApiError } from '../utils/errors.js';

const bookingSchema = Joi.object({
  room_id: Joi.number().required(),
  check_in: Joi.date().required(),
  check_out: Joi.date().required(),
  status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed').default('pending'),
  total_price: Joi.number().min(0).optional(),
});

export const listBookings = async (req, res) => {
  const bookings = await Booking.list(req.query);
  res.json({ bookings });
};

export const myBookings = async (req, res) => {
  const bookings = await Booking.list({ user_id: req.user.id });
  res.json({ bookings });
};

export const createBooking = async (req, res, next) => {
  const { error, value } = bookingSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));

  if (new Date(value.check_out) <= new Date(value.check_in)) {
    return next(new ApiError(400, 'Check-out must be after check-in'));
  }

  const room = await Room.findById(value.room_id);
  if (!room) return next(new ApiError(404, 'Room not found'));

  const hasConflict = await Booking.hasOverlap(value.room_id, value.check_in, value.check_out);
  if (hasConflict) return next(new ApiError(400, 'Room is not available for selected dates'));

  const nights = Math.ceil((new Date(value.check_out) - new Date(value.check_in)) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * Number(room.price);
  const booking = await Booking.create({
    ...value,
    user_id: req.user.id,
    total_price: totalPrice,
  });
  res.status(201).json({ booking });
};

export const updateBooking = async (req, res, next) => {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return next(new ApiError(400, 'Invalid status'));
  }
  const booking = await Booking.update(req.params.id, { status });
  if (!booking) return next(new ApiError(404, 'Booking not found'));

  if (status === 'confirmed') {
    await Room.update(booking.room_id, { status: 'occupied' });
  }
  if (status === 'completed') {
    await Room.update(booking.room_id, { status: 'available' });
  }

  res.json({ booking });
};

export const deleteBooking = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new ApiError(404, 'Booking not found'));
  if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Forbidden'));
  }
  await Booking.update(req.params.id, { status: 'cancelled' });
  res.status(204).end();
};

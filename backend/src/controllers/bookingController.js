import Joi from 'joi';
import { Booking } from '../models/Booking.js';
import { Room } from '../models/Room.js';
import { ApiError } from '../utils/errors.js';
import { config } from '../config/index.js';
import { Payment } from '../models/Payment.js';
import { Task } from '../models/Task.js';
import { addonServices, calculateExtrasTotal, mealPackages, sanitizeAddons } from '../utils/catalog.js';

const mealOptions = Object.keys(mealPackages);
const addonOptions = Object.keys(addonServices);

const bookingSchema = Joi.object({
  room_id: Joi.number().required(),
  check_in: Joi.date().required(),
  check_out: Joi.date().required(),
  guest_count: Joi.number().min(1).max(8).required(),
  requested_room_type: Joi.string().allow('', null),
  meal_package: Joi.string()
    .valid(...mealOptions)
    .default('room-only'),
  addons: Joi.array()
    .items(Joi.string().valid(...addonOptions))
    .default([]),
  preferences: Joi.string().allow('', null),
  special_requests: Joi.string().allow('', null),
});

const createOperationalTasks = async (booking) => {
  if (!booking) return;
  const existingTasks = await Task.list({ booking_id: booking.id });
  if (existingTasks.length) return;

  const addons = booking.addons || [];
  const tasksToCreate = [
    {
      title: `Prep room ${booking.room_id}`,
      description: 'Prepare room and amenities prior to guest arrival',
      booking_id: booking.id,
      room_id: booking.room_id,
      status: 'pending',
      department: 'housekeeping',
      task_type: 'booking_prep',
      priority: 'high',
      due_date: booking.check_in,
    },
    booking.special_requests
      ? {
          title: 'Special request follow-up',
          description: booking.special_requests,
          booking_id: booking.id,
          room_id: booking.room_id,
          status: 'pending',
          department: 'guest_services',
          task_type: 'custom_request',
          priority: 'normal',
        }
      : null,
    booking.meal_package !== 'room-only'
      ? {
          title: `Arrange ${booking.meal_package} meal plan`,
          description: `Ensure dining plan ready for booking ${booking.id}`,
          booking_id: booking.id,
          status: 'pending',
          department: 'catering',
          task_type: 'meal_plan',
          priority: 'normal',
        }
      : null,
    addons.includes('spa')
      ? {
          title: 'Schedule spa treatments',
          description: 'Coordinate spa appointments for guest',
          booking_id: booking.id,
          status: 'pending',
          department: 'spa',
          task_type: 'addon_service',
        }
      : null,
    addons.includes('tour')
      ? {
          title: 'Arrange city tour',
          description: 'Confirm external tour partner availability',
          booking_id: booking.id,
          status: 'pending',
          department: 'concierge',
          task_type: 'addon_service',
        }
      : null,
  ].filter(Boolean);

  if (!tasksToCreate.length) return;
  await Promise.all(tasksToCreate.map((task) => Task.create(task)));
};

const buildInvoiceResponse = (booking) => ({
  invoice_number: booking.invoice_number,
  due_at: booking.invoice_due_at,
  payment_status: booking.payment_status,
  total: Number(booking.total_price || 0),
  extras_total: Number(booking.extras_total || 0),
});

export const listBookings = async (req, res) => {
  await Booking.expireOverduePayments();
  const bookings = await Booking.list(req.query);
  res.json({ bookings });
};

export const myBookings = async (req, res) => {
  await Booking.expireOverduePayments();
  const bookings = await Booking.list({ user_id: req.user.id });
  res.json({ bookings });
};

export const createBooking = async (req, res, next) => {
  await Booking.expireOverduePayments();
  const { error, value } = bookingSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));

  if (new Date(value.check_out) <= new Date(value.check_in)) {
    return next(new ApiError(400, 'Check-out must be after check-in'));
  }

  const room = await Room.findById(value.room_id);
  if (!room) return next(new ApiError(404, 'Room not found'));
  if (room.capacity < value.guest_count) {
    return next(new ApiError(400, 'Room cannot accommodate selected number of guests'));
  }

  const hasConflict = await Booking.hasOverlap(value.room_id, value.check_in, value.check_out);
  if (hasConflict) return next(new ApiError(400, 'Room is not available for selected dates'));

  const nights = Math.ceil((new Date(value.check_out) - new Date(value.check_in)) / (1000 * 60 * 60 * 24));
  const sanitizedAddons = sanitizeAddons(value.addons);
  const extrasTotal = calculateExtrasTotal({ mealPackage: value.meal_package, addons: sanitizedAddons });
  const totalPrice = nights * Number(room.price) + extrasTotal;
  const invoiceDueAt = new Date(Date.now() + config.paymentWindowMinutes * 60 * 1000).toISOString();
  const booking = await Booking.create({
    ...value,
    addons: sanitizedAddons,
    user_id: req.user.id,
    total_price: totalPrice,
    extras_total: extrasTotal,
    status: 'pending',
    payment_status: 'pending',
    invoice_number: `INV-${Date.now()}`,
    invoice_due_at: invoiceDueAt,
  });
  await Payment.createPending(booking.id, totalPrice);
  res.status(201).json({ booking, invoice: buildInvoiceResponse(booking) });
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
    await createOperationalTasks(booking);
  }
  if (status === 'completed') {
    await Room.update(booking.room_id, { status: 'available' });
  }
  if (status === 'cancelled') {
    await Booking.update(booking.id, { payment_status: 'cancelled', cancel_reason: 'Cancelled by admin' });
  }

  res.json({ booking });
};

export const deleteBooking = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new ApiError(404, 'Booking not found'));
  if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Forbidden'));
  }
  await Booking.update(req.params.id, { status: 'cancelled', payment_status: 'cancelled', cancel_reason: 'Cancelled by guest' });
  res.status(204).end();
};

export const payForBooking = async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new ApiError(404, 'Booking not found'));
  if (booking.user_id !== req.user.id) {
    return next(new ApiError(403, 'Forbidden'));
  }
  if (booking.payment_status === 'paid') {
    return res.json({ booking, invoice: buildInvoiceResponse(booking) });
  }
  if (booking.invoice_due_at && new Date(booking.invoice_due_at) < new Date()) {
    await Booking.update(booking.id, { payment_status: 'expired', status: 'cancelled' });
    return next(new ApiError(400, 'Invoice expired. Please create a new booking.'));
  }

  const updated = await Booking.update(booking.id, {
    payment_status: 'paid',
    status: 'confirmed',
    paid_at: new Date().toISOString(),
    cancel_reason: null,
  });
  await Payment.markPaid(booking.id, { amount: updated.total_price, method: req.body?.method || 'card' });
  await Room.update(updated.room_id, { status: 'occupied' });
  await createOperationalTasks(updated);
  res.json({ booking: updated, invoice: buildInvoiceResponse(updated) });
};

import Joi from 'joi';
import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { ApiError } from '../utils/errors.js';

const reviewSchema = Joi.object({
  booking_id: Joi.number().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().allow('', null),
});

export const listReviews = async (req, res) => {
  const reviews = await Review.list(req.query);
  res.json({ reviews });
};

export const createReview = async (req, res, next) => {
  const { error, value } = reviewSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const booking = await Booking.findById(value.booking_id);
  if (!booking || booking.user_id !== req.user.id) {
    return next(new ApiError(404, 'Booking not found'));
  }
  if (new Date(booking.check_out) > new Date()) {
    return next(new ApiError(400, 'Reviews are only allowed after check-out'));
  }
  const review = await Review.create({ ...value, user_id: req.user.id });
  res.status(201).json({ review });
};

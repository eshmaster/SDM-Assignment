import Joi from 'joi';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Vendor } from '../models/Vendor.js';
import { config } from '../config/index.js';
import { ApiError } from '../utils/errors.js';

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('guest', 'vendor').required(),
  service_type: Joi.string().allow('', null),
  vendor_rate: Joi.number().min(0).allow(null),
  phone: Joi.string().allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '12h' });

export const register = async (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));

  const existing = await User.findByEmail(value.email);
  if (existing) return next(new ApiError(400, 'Email already in use'));

  const user = await User.create(value);

  if (value.role === 'vendor') {
    await Vendor.create({
      user_id: user.id,
      name: value.name,
      email: value.email,
      approval_status: 'pending',
      service_type: value.service_type,
      rate: value.vendor_rate,
      phone: value.phone,
    });
  }

  const token = signToken(user);
  res.status(201).json({ user, token });
};

export const login = async (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));

  const user = await User.findByEmail(value.email);
  if (!user) return next(new ApiError(401, 'Invalid credentials'));
  const valid = await User.validatePassword(user, value.password);
  if (!valid) return next(new ApiError(401, 'Invalid credentials'));

  const token = signToken(user);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
};

export const me = async (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role } });
};

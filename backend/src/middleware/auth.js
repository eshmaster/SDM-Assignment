import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { ApiError } from '../utils/errors.js';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required'));
  }

  const token = header.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) return next(new ApiError(401, 'User not found'));
    req.user = user;
    return next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid token'));
  }
};

export const authorize = (roles = []) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required'));
  if (roles.length && !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden'));
  }
  return next();
};

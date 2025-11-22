import Joi from 'joi';
import { Vendor } from '../models/Vendor.js';
import { ApiError } from '../utils/errors.js';

const vendorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  service_type: Joi.string().allow('', null),
});

export const listVendors = async (req, res) => {
  const vendors = await Vendor.list(req.query);
  res.json({ vendors });
};

export const createVendor = async (req, res, next) => {
  const { error, value } = vendorSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const vendor = await Vendor.create({ ...value, user_id: req.user.id, approval_status: 'pending' });
  res.status(201).json({ vendor });
};

export const approveVendor = async (req, res) => {
  const vendor = await Vendor.update(req.params.id, { approval_status: 'approved' });
  res.json({ vendor });
};

export const rejectVendor = async (req, res) => {
  const vendor = await Vendor.update(req.params.id, { approval_status: 'rejected' });
  res.json({ vendor });
};

export const myJobs = async (req, res) => {
  const jobs = await Vendor.list({ user_id: req.user.id });
  res.json({ jobs });
};

export const updateJobStatus = async (req, res) => {
  const { status } = req.body;
  const vendor = await Vendor.update(req.params.id, { approval_status: status });
  res.json({ vendor });
};

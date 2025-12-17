import Joi from 'joi';
import { db } from '../config/db.js';
import { Vendor } from '../models/Vendor.js';
import { ApiError } from '../utils/errors.js';
import { Task } from '../models/Task.js';

const vendorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  service_type: Joi.string().allow('', null),
  rate: Joi.number().min(0).default(0),
  phone: Joi.string().allow('', null),
});

const vendorUpdateSchema = Joi.object({
  name: Joi.string().min(2).allow('', null),
  service_type: Joi.string().allow('', null),
  rate: Joi.number().min(0).allow(null),
  phone: Joi.string().allow('', null),
}).min(1);

const fetchVendorOrThrow = async (userId) => {
  const vendor = await Vendor.findByUserId(userId);
  if (!vendor) throw new ApiError(404, 'Vendor profile not found');
  return vendor;
};

export const listVendors = async (req, res) => {
  const vendors = await Vendor.list(req.query);
  res.json({ vendors });
};

export const createVendor = async (req, res, next) => {
  const { error, value } = vendorSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const vendor = await Vendor.create({
    ...value,
    user_id: req.user.id,
    approval_status: 'pending',
  });
  res.status(201).json({ vendor });
};

export const approveVendor = async (req, res) => {
  const vendor = await Vendor.update(req.params.id, { approval_status: 'approved', approved_at: new Date().toISOString() });
  res.json({ vendor });
};

export const rejectVendor = async (req, res) => {
  const vendor = await Vendor.update(req.params.id, { approval_status: 'rejected' });
  res.json({ vendor });
};

export const myProfile = async (req, res) => {
  const vendor = await fetchVendorOrThrow(req.user.id);
  res.json({ vendor });
};

export const updateProfile = async (req, res, next) => {
  const { error, value } = vendorUpdateSchema.validate(req.body);
  if (error) return next(new ApiError(400, error.message));
  const vendor = await fetchVendorOrThrow(req.user.id);
  const updated = await Vendor.update(vendor.id, value);
  res.json({ vendor: updated });
};

export const myJobs = async (req, res) => {
  const vendor = await fetchVendorOrThrow(req.user.id);
  const jobs = await Task.list({ vendor_id: vendor.id });
  res.json({ jobs });
};

export const updateJobStatus = async (req, res, next) => {
  const vendor = await fetchVendorOrThrow(req.user.id);
  const { status } = req.body;
  if (!['pending', 'in_progress', 'done'].includes(status)) {
    return next(new ApiError(400, 'Invalid status'));
  }
  const task = await Task.findById(req.params.id);
  if (!task || task.vendor_id !== vendor.id) {
    return next(new ApiError(404, 'Job not found'));
  }
  const updates = { status };
  if (status === 'done') {
    updates.vendor_fee = vendor.rate || task.vendor_fee;
  }
  const updated = await Task.update(task.id, updates);
  res.json({ task: updated });
};

export const paymentStatement = async (req, res) => {
  const vendor = await fetchVendorOrThrow(req.user.id);

  const baseQuery = db('tasks').where({ vendor_id: vendor.id });
  const [totalJobsRow] = await baseQuery.clone().count({ count: '*' });
  const [completedRow] = await baseQuery.clone().where({ status: 'done' }).count({ count: '*' });
  const [inProgressRow] = await baseQuery.clone().where({ status: 'in_progress' }).count({ count: '*' });
  const [pendingRow] = await baseQuery.clone().where({ status: 'pending' }).count({ count: '*' });
  const [earnedRow] = await baseQuery.clone().where({ status: 'done' }).sum({ total: 'vendor_fee' });
  const [pendingValueRow] = await baseQuery.clone().whereNot({ status: 'done' }).sum({ total: 'vendor_fee' });

  const jobs = await baseQuery
    .clone()
    .select('id', 'title', 'department', 'task_type', 'status', 'vendor_fee', 'updated_at', 'due_date')
    .orderBy('updated_at', 'desc')
    .limit(10);

  res.json({
    statement: {
      totalJobs: Number(totalJobsRow?.count || 0),
      completedJobs: Number(completedRow?.count || 0),
      inProgressJobs: Number(inProgressRow?.count || 0),
      pendingJobs: Number(pendingRow?.count || 0),
      totalEarned: Number(earnedRow?.total || 0),
      pendingValue: Number(pendingValueRow?.total || 0),
    },
    jobs,
  });
};

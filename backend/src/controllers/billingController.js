import { db } from '../config/db.js';
import { Payment } from '../models/Payment.js';

const toNumber = (value) => Number(value?.count || value?.total || 0);

export const billingSummary = async (req, res) => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString();

  const revenue = await Payment.sumRevenue(startOfMonth, endOfMonth);
  const [outstandingInvoices] = await db('bookings').where({ payment_status: 'pending' }).count({ count: '*' });
  const [vendorFeesRow] = await db('tasks')
    .whereNotNull('vendor_id')
    .andWhere('status', 'done')
    .sum({ total: 'vendor_fee' });
  const [completedJobs] = await db('tasks').whereNotNull('vendor_id').andWhere('status', 'done').count({ count: '*' });

  res.json({
    month: startOfMonth.slice(0, 7),
    revenue,
    outstandingInvoices: toNumber(outstandingInvoices),
    vendorFeesDue: Number(vendorFeesRow?.total || 0),
    completedVendorJobs: toNumber(completedJobs),
  });
};

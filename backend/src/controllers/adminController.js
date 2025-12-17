import { db } from '../config/db.js';
import { Payment } from '../models/Payment.js';

const toNumber = (value) => Number(value?.count || value?.total || 0);

export const stats = async (req, res) => {
  const today = new Date();
  const todayDate = today.toISOString().split('T')[0];
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString();

  const [rooms] = await db('rooms').count({ count: '*' });
  const [upcoming] = await db('bookings').where('check_in', '>=', todayDate).count({ count: '*' });
  const [pendingVendors] = await db('vendors').where({ approval_status: 'pending' }).count({ count: '*' });
  const [openTasks] = await db('tasks').whereNot('status', 'done').count({ count: '*' });
  const [pendingInvoices] = await db('bookings').where({ payment_status: 'pending' }).count({ count: '*' });
  const [openRequests] = await db('service_requests')
    .whereNotIn('status', ['completed', 'cancelled'])
    .count({ count: '*' });
  const [occupiedRooms] = await db('bookings')
    .where({ status: 'confirmed' })
    .andWhere('check_in', '<=', todayDate)
    .andWhere('check_out', '>=', todayDate)
    .count({ count: '*' });
  const [vendorSpendRow] = await db('tasks').whereNotNull('vendor_id').andWhere('status', 'done').sum({ total: 'vendor_fee' });
  const serviceDemand = await db('service_requests')
    .select('type')
    .count({ count: '*' })
    .groupBy('type')
    .orderBy('count', 'desc');

  const monthlyRevenue = await Payment.sumRevenue(startOfMonth, endOfMonth);
  const totalRooms = toNumber(rooms);
  const occupancyRate = totalRooms ? Math.round((toNumber(occupiedRooms) / totalRooms) * 100) : 0;

  res.json({
    rooms: totalRooms,
    upcoming: toNumber(upcoming),
    pendingVendors: toNumber(pendingVendors),
    openTasks: toNumber(openTasks),
    monthlyRevenue,
    pendingInvoices: toNumber(pendingInvoices),
    vendorSpend: Number(vendorSpendRow?.total || 0),
    openRequests: toNumber(openRequests),
    occupancyRate,
    serviceDemand: serviceDemand.map((row) => ({ type: row.type, count: Number(row.count) })),
  });
};

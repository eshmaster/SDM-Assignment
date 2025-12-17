import { db } from '../config/db.js';

const TABLE = 'bookings';

const parseAddons = (value) => {
  if (!value) return [];
  try {
    return Array.isArray(value) ? value : JSON.parse(value);
  } catch (err) {
    return [];
  }
};

const mapBooking = (booking) => (booking ? { ...booking, addons: parseAddons(booking.addons) } : null);

export class Booking {
  static async create(payload) {
    const insertPayload = payload.addons ? { ...payload, addons: JSON.stringify(payload.addons) } : payload;
    const [booking] = await db(TABLE).insert(insertPayload).returning('*');
    return mapBooking(booking);
  }

  static async findById(id) {
    const booking = await db(TABLE).where({ id }).first();
    return mapBooking(booking);
  }

  static async list(filters = {}) {
    const query = db(`${TABLE} as b`)
      .leftJoin('rooms as r', 'b.room_id', 'r.id')
      .leftJoin('users as u', 'b.user_id', 'u.id')
      .select(
        'b.*',
        'r.name as room_name',
        'r.status as room_status',
        'r.price as room_price',
        'u.email as user_email'
      );
    if (filters.user_id) query.where('b.user_id', filters.user_id);
    if (filters.status) query.where('b.status', filters.status);
    if (filters.payment_status) query.where('b.payment_status', filters.payment_status);
    const bookings = await query;
    return bookings.map(mapBooking);
  }

  static async update(id, payload) {
    const updatePayload = payload.addons ? { ...payload, addons: JSON.stringify(payload.addons) } : payload;
    const [booking] = await db(TABLE).where({ id }).update(updatePayload).returning('*');
    return mapBooking(booking);
  }

  static async remove(id) {
    return db(TABLE).where({ id }).del();
  }

  static async hasOverlap(roomId, checkIn, checkOut) {
    const conflicts = await db(TABLE)
      .where({ room_id: roomId })
      .andWhere((qb) =>
        qb
          .whereBetween('check_in', [checkIn, checkOut])
          .orWhereBetween('check_out', [checkIn, checkOut])
          .orWhere((nested) => nested.where('check_in', '<', checkIn).where('check_out', '>', checkOut))
      )
      .andWhereNot('status', 'cancelled')
      .count('* as count')
      .first();
    return Number(conflicts.count) > 0;
  }

  static async expireOverduePayments(referenceDate = new Date()) {
    const nowIso = new Date(referenceDate).toISOString();
    return db(TABLE)
      .where({ payment_status: 'pending' })
      .whereNot({ status: 'cancelled' })
      .whereNotNull('invoice_due_at')
      .andWhere('invoice_due_at', '<', nowIso)
      .update({ payment_status: 'expired', status: 'cancelled', cancel_reason: 'Invoice expired' });
  }
}

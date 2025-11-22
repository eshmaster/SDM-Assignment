import { db } from '../config/db.js';

const TABLE = 'bookings';

export class Booking {
  static async create(payload) {
    const [booking] = await db(TABLE).insert(payload).returning('*');
    return booking;
  }

  static async findById(id) {
    return db(TABLE).where({ id }).first();
  }

  static list(filters = {}) {
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
    return query;
  }

  static async update(id, payload) {
    const [booking] = await db(TABLE).where({ id }).update(payload).returning('*');
    return booking;
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
}

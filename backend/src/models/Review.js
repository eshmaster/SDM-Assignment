import { db } from '../config/db.js';

const TABLE = 'reviews';

export class Review {
  static async create(payload) {
    const [review] = await db(TABLE).insert(payload).returning('*');
    return review;
  }

  static async list(filters = {}) {
    const query = db(`${TABLE} as rv`)
      .leftJoin('bookings as b', 'rv.booking_id', 'b.id')
      .leftJoin('rooms as r', 'b.room_id', 'r.id')
      .select('rv.*', 'r.name as room_name');
    if (filters.user_id) query.where('rv.user_id', filters.user_id);
    if (filters.room_id) query.where('b.room_id', filters.room_id);
    return query;
  }
}

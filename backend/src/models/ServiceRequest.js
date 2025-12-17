import { db } from '../config/db.js';

const TABLE = 'service_requests';

export class ServiceRequest {
  static async create(payload) {
    const [request] = await db(TABLE).insert(payload).returning('*');
    return request;
  }

  static async list(filters = {}) {
    const query = db(`${TABLE} as sr`)
      .leftJoin('bookings as b', 'sr.booking_id', 'b.id')
      .leftJoin('rooms as r', 'b.room_id', 'r.id')
      .leftJoin('users as u', 'sr.user_id', 'u.id')
      .select('sr.*', 'r.name as room_name', 'u.email as guest_email');
    if (filters.user_id) query.where('sr.user_id', filters.user_id);
    if (filters.status) query.where('sr.status', filters.status);
    if (filters.type) query.where('sr.type', filters.type);
    return query;
  }

  static async findById(id) {
    return db(TABLE).where({ id }).first();
  }

  static async update(id, payload) {
    const [request] = await db(TABLE).where({ id }).update(payload).returning('*');
    return request;
  }
}

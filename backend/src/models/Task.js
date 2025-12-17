import { db } from '../config/db.js';

const TABLE = 'tasks';

export class Task {
  static async create(payload) {
    const [task] = await db(TABLE).insert(payload).returning('*');
    return task;
  }

  static list(filters = {}) {
    const query = db(`${TABLE} as t`)
      .leftJoin('users as u', 't.staff_id', 'u.id')
      .leftJoin('rooms as r', 't.room_id', 'r.id')
      .leftJoin('service_requests as sr', 't.request_id', 'sr.id')
      .select('t.*', 'u.email as staff_email', 'r.name as room_name', 'sr.type as request_type');
    if (filters.staff_id) query.where('t.staff_id', filters.staff_id);
    if (filters.booking_id) query.where('t.booking_id', filters.booking_id);
    if (filters.vendor_id) query.where('t.vendor_id', filters.vendor_id);
    if (filters.department) query.where('t.department', filters.department);
    if (filters.status) query.where('t.status', filters.status);
    return query;
  }

  static async findById(id) {
    return db(TABLE).where({ id }).first();
  }

  static async update(id, payload) {
    const [task] = await db(TABLE).where({ id }).update(payload).returning('*');
    return task;
  }
}

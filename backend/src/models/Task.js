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
      .select('t.*', 'u.email as staff_email');
    if (filters.staff_id) query.where('t.staff_id', filters.staff_id);
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

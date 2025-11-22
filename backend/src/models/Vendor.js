import { db } from '../config/db.js';

const TABLE = 'vendors';

export class Vendor {
  static async create(payload) {
    const [vendor] = await db(TABLE).insert(payload).returning('*');
    return vendor;
  }

  static list(filters = {}) {
    const query = db(TABLE);
    if (filters.approval_status) query.where({ approval_status: filters.approval_status });
    if (filters.user_id) query.where({ user_id: filters.user_id });
    return query;
  }

  static async findById(id) {
    return db(TABLE).where({ id }).first();
  }

  static async update(id, payload) {
    const [vendor] = await db(TABLE).where({ id }).update(payload).returning('*');
    return vendor;
  }
}

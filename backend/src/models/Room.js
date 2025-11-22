import { db } from '../config/db.js';

const TABLE = 'rooms';

export class Room {
  static async create(payload) {
    const [room] = await db(TABLE).insert(payload).returning('*');
    return room;
  }

  static list(filters = {}) {
    const query = db(TABLE);
    if (filters.status) query.where({ status: filters.status });
    if (filters.type) query.where({ type: filters.type });
    return query;
  }

  static async findById(id) {
    return db(TABLE).where({ id }).first();
  }

  static async update(id, payload) {
    const [room] = await db(TABLE).where({ id }).update(payload).returning('*');
    return room;
  }

  static async remove(id) {
    return db(TABLE).where({ id }).del();
  }
}

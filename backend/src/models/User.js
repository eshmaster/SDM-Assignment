import bcrypt from 'bcrypt';
import { db } from '../config/db.js';

const TABLE = 'users';
const SALT_ROUNDS = 10;

export class User {
  static async create({ name, email, password, role }) {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const [user] = await db(TABLE)
      .insert({ name, email, password: hashed, role })
      .onConflict('email')
      .merge()
      .returning(['id', 'name', 'email', 'role', 'created_at']);
    return user;
  }

  static async findByEmail(email) {
    return db(TABLE).where({ email }).first();
  }

  static async findById(id) {
    return db(TABLE).where({ id }).first();
  }

  static async validatePassword(user, password) {
    return bcrypt.compare(password, user.password);
  }

  static async list({ role } = {}) {
    const query = db(TABLE).select('id', 'name', 'email', 'role', 'created_at');
    if (role) query.where({ role });
    return query;
  }
}

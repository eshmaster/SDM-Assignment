import { db } from '../config/db.js';

const TABLE = 'payments';

export class Payment {
  static async create(payload) {
    const [payment] = await db(TABLE).insert(payload).returning('*');
    return payment;
  }

  static async latestForBooking(bookingId) {
    return db(TABLE).where({ booking_id: bookingId }).orderBy('created_at', 'desc').first();
  }

  static async createPending(bookingId, amount) {
    return this.create({ booking_id: bookingId, amount, status: 'pending' });
  }

  static async markPaid(bookingId, { amount, method = 'card', transaction_ref } = {}) {
    const processed_at = new Date().toISOString();
    const existing = await this.latestForBooking(bookingId);
    if (existing) {
      const [updated] = await db(TABLE)
        .where({ id: existing.id })
        .update({
          status: 'paid',
          processed_at,
          method,
          amount: amount ?? existing.amount,
          transaction_ref: transaction_ref || existing.transaction_ref || `TX-${Date.now()}`,
        })
        .returning('*');
      return updated;
    }
    return this.create({
      booking_id: bookingId,
      amount,
      status: 'paid',
      method,
      processed_at,
      transaction_ref: transaction_ref || `TX-${Date.now()}`,
    });
  }

  static async sumRevenue(start, end) {
    const [row] = await db(TABLE)
      .where({ status: 'paid' })
      .andWhereBetween('processed_at', [start, end])
      .sum({ total: 'amount' });
    return Number(row?.total || 0);
  }
}

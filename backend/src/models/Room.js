import { db } from '../config/db.js';

const TABLE = 'rooms';

const parseAmenities = (value) => {
  if (!value) return [];
  try {
    return Array.isArray(value) ? value : JSON.parse(value);
  } catch (err) {
    return [];
  }
};

const mapRoom = (room) => (room ? { ...room, amenities: parseAmenities(room.amenities) } : null);

export class Room {
  static async create(payload) {
    const formatted = payload.amenities
      ? { ...payload, amenities: JSON.stringify(payload.amenities) }
      : payload;
    const [room] = await db(TABLE).insert(formatted).returning('*');
    return mapRoom(room);
  }

  static async list(filters = {}) {
    const query = db(TABLE);
    if (filters.status) query.where({ status: filters.status });
    if (filters.type) query.where({ type: filters.type });
    if (filters.capacity) query.where('capacity', '>=', Number(filters.capacity));
    if (filters.search) query.whereILike('name', `%${filters.search}%`);
    if (filters.amenities?.length) {
      filters.amenities.forEach((amenity) => {
        query.whereRaw("LOWER(amenities) LIKE ?", [`%${amenity.toLowerCase()}%`]);
      });
    }
    const rooms = await query;
    return rooms.map(mapRoom);
  }

  static async search(filters = {}) {
    const query = db(`${TABLE} as r`);
    if (filters.type) query.where('r.type', filters.type);
    if (filters.capacity) query.where('r.capacity', '>=', Number(filters.capacity));
    if (filters.status) query.where('r.status', filters.status);
    if (filters.amenities?.length) {
      filters.amenities.forEach((amenity) => {
        query.whereRaw("LOWER(r.amenities) LIKE ?", [`%${amenity.toLowerCase()}%`]);
      });
    }
    if (filters.check_in && filters.check_out) {
      query.whereNotExists(function roomOverlap() {
        this.select('*')
          .from('bookings as b')
          .whereRaw('b.room_id = r.id')
          .andWhereNot('b.status', 'cancelled')
          .andWhere(function overlap() {
            this.whereBetween('b.check_in', [filters.check_in, filters.check_out])
              .orWhereBetween('b.check_out', [filters.check_in, filters.check_out])
              .orWhere(function surrounding() {
                this.where('b.check_in', '<', filters.check_in).where('b.check_out', '>', filters.check_out);
              });
          });
      });
    }
    const rooms = await query.select('r.*');
    return rooms.map(mapRoom);
  }

  static async findById(id) {
    const room = await db(TABLE).where({ id }).first();
    return mapRoom(room);
  }

  static async update(id, payload) {
    const formatted = payload.amenities
      ? { ...payload, amenities: JSON.stringify(payload.amenities) }
      : payload;
    const [room] = await db(TABLE).where({ id }).update(formatted).returning('*');
    return mapRoom(room);
  }

  static async remove(id) {
    return db(TABLE).where({ id }).del();
  }
}

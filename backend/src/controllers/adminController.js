import { db } from '../config/db.js';

export const stats = async (req, res) => {
  const [[rooms]] = await db.raw('SELECT COUNT(*)::int AS count FROM rooms');
  const [[upcoming]] = await db.raw("SELECT COUNT(*)::int AS count FROM bookings WHERE check_in >= CURRENT_DATE");
  const [[pendingVendors]] = await db.raw("SELECT COUNT(*)::int AS count FROM vendors WHERE approval_status='pending'");
  const [[openTasks]] = await db.raw("SELECT COUNT(*)::int AS count FROM tasks WHERE status!='done'");
  res.json({
    rooms: rooms.count,
    upcoming: upcoming.count,
    pendingVendors: pendingVendors.count,
    openTasks: openTasks.count,
  });
};

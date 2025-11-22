import bcrypt from 'bcrypt';

export const seed = async (knex) => {
  await knex('tasks').del();
  await knex('bookings').del();
  await knex('vendors').del();
  await knex('rooms').del();
  await knex('users').del();

  const password = await bcrypt.hash('password123', 10);

  const [admin, staff, guest, vendorUser] = await knex('users')
    .insert(
      [
        { name: 'Admin User', email: 'admin@example.com', password, role: 'admin' },
        { name: 'Staff User', email: 'staff@example.com', password, role: 'staff' },
        { name: 'Guest User', email: 'guest@example.com', password, role: 'guest' },
        { name: 'Vendor User', email: 'vendor@example.com', password, role: 'vendor' },
      ],
      ['id', 'name', 'email', 'role']
    )
    .returning('*');

  const rooms = await knex('rooms')
    .insert(
      [
        { name: 'Deluxe Suite', type: 'suite', price: 250, status: 'available', description: 'Spacious suite.' },
        { name: 'Standard Room', type: 'standard', price: 120, status: 'occupied', description: 'Cozy and clean.' },
        { name: 'Executive Room', type: 'executive', price: 180, status: 'maintenance', description: 'City view.' },
      ],
      ['id']
    )
    .returning('*');

  const [vendor] = await knex('vendors')
    .insert(
      {
        user_id: vendorUser.id,
        name: 'ACME Cleaning',
        email: 'vendor@example.com',
        service_type: 'Cleaning',
        approval_status: 'pending',
      },
      ['id']
    )
    .returning('*');

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  await knex('bookings').insert(
    {
      user_id: guest.id,
      room_id: rooms[0].id,
      check_in: today.toISOString().split('T')[0],
      check_out: nextWeek.toISOString().split('T')[0],
      total_price: 6 * 250,
      status: 'confirmed',
    },
    ['id']
  );

  await knex('tasks').insert([
    {
      title: 'Prepare room for guest',
      description: 'Deep clean before arrival',
      room_id: rooms[0].id,
      staff_id: staff.id,
      status: 'in_progress',
      due_date: tomorrow.toISOString().split('T')[0],
    },
    {
      title: 'Vendor welcome package',
      description: 'Coordinate with vendor for amenity delivery',
      vendor_id: vendor.id,
      status: 'pending',
    },
  ]);
};

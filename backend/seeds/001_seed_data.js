import bcrypt from 'bcrypt';

export const seed = async (knex) => {
  await knex('reviews').del();
  await knex('tasks').del();
  await knex('service_requests').del();
  await knex('payments').del();
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
        {
          name: 'Deluxe Suite',
          type: 'suite',
          price: 250,
          capacity: 4,
          amenities: JSON.stringify(['king bed', 'balcony', 'workspace']),
          status: 'available',
          description: 'Spacious suite.',
        },
        {
          name: 'Standard Room',
          type: 'standard',
          price: 120,
          capacity: 2,
          amenities: JSON.stringify(['queen bed', 'wifi']),
          status: 'occupied',
          description: 'Cozy and clean.',
        },
        {
          name: 'Executive Room',
          type: 'executive',
          price: 180,
          capacity: 3,
          amenities: JSON.stringify(['king bed', 'city view', 'desk']),
          status: 'maintenance',
          description: 'City view.',
        },
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
        rate: 80,
      },
      ['id']
    )
    .returning('*');

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const invoiceNumber = `INV-${Date.now()}`;
  const bookingNights = 6;
  const extrasTotal = 150;
  const totalBookingPrice = bookingNights * 250 + extrasTotal;
  const [booking] = await knex('bookings')
    .insert(
      {
        user_id: guest.id,
        room_id: rooms[0].id,
        check_in: today.toISOString().split('T')[0],
        check_out: nextWeek.toISOString().split('T')[0],
        total_price: totalBookingPrice,
        status: 'confirmed',
        guest_count: 2,
        requested_room_type: 'suite',
        meal_package: 'full-board',
        addons: JSON.stringify(['airport_pickup', 'spa']),
        extras_total: extrasTotal,
        payment_status: 'paid',
        invoice_number: invoiceNumber,
        invoice_due_at: tomorrow.toISOString(),
        paid_at: today.toISOString(),
        special_requests: 'Late check-in',
      },
      ['id']
    )
    .returning('*');

  await knex('payments').insert({
    booking_id: booking.id,
    amount: totalBookingPrice,
    status: 'paid',
    method: 'card',
    transaction_ref: 'SEEDPAY123',
    processed_at: today.toISOString(),
  });

  const [request] = await knex('service_requests')
    .insert(
      {
        booking_id: booking.id,
        user_id: guest.id,
        type: 'spa',
        details: 'Deep tissue massage',
        preferred_time: tomorrow.toISOString(),
        status: 'scheduled',
        assigned_staff_id: staff.id,
        notes: 'Confirm therapist availability',
      },
      ['id']
    )
    .returning('*');

  await knex('tasks').insert([
    {
      title: 'Prepare room for guest',
      description: 'Deep clean before arrival',
      room_id: rooms[0].id,
      staff_id: staff.id,
      status: 'in_progress',
      department: 'housekeeping',
      task_type: 'booking_prep',
      priority: 'high',
      due_date: tomorrow.toISOString().split('T')[0],
    },
    {
      title: 'Vendor welcome package',
      description: 'Coordinate with vendor for amenity delivery',
      vendor_id: vendor.id,
      status: 'pending',
      department: 'catering',
      task_type: 'vendor_service',
      vendor_fee: 80,
    },
    {
      title: 'Guest spa appointment',
      description: 'Arrange spa therapist',
      staff_id: staff.id,
      status: 'pending',
      department: 'spa',
      task_type: 'service_request',
      request_id: request.id,
    },
  ]);

  await knex('reviews').insert({
    booking_id: booking.id,
    user_id: guest.id,
    rating: 5,
    comment: 'Excellent stay with great service!',
  });
};

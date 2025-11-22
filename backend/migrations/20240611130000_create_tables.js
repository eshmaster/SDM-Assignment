export const up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.enu('role', ['guest', 'admin', 'staff', 'vendor']).notNullable().defaultTo('guest');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('rooms', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('type');
    table.decimal('price', 10, 2).notNullable().defaultTo(0);
    table.enu('status', ['available', 'occupied', 'maintenance']).notNullable().defaultTo('available');
    table.text('description');
    table.timestamps(true, true);
    table.index('status');
  });

  await knex.schema.createTable('vendors', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('email').notNullable();
    table.string('service_type');
    table.enu('approval_status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('bookings', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('room_id').unsigned().references('id').inTable('rooms').onDelete('CASCADE');
    table.date('check_in').notNullable();
    table.date('check_out').notNullable();
    table.decimal('total_price', 10, 2).notNullable().defaultTo(0);
    table.enu('status', ['pending', 'confirmed', 'cancelled', 'completed']).notNullable().defaultTo('pending');
    table.timestamps(true, true);
    table.index(['room_id', 'check_in', 'check_out'], 'bookings_room_date_idx');
  });

  await knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.integer('booking_id').unsigned().references('id').inTable('bookings').onDelete('SET NULL');
    table.integer('room_id').unsigned().references('id').inTable('rooms').onDelete('SET NULL');
    table.integer('staff_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.integer('vendor_id').unsigned().references('id').inTable('vendors').onDelete('SET NULL');
    table.enu('status', ['pending', 'in_progress', 'done']).notNullable().defaultTo('pending');
    table.date('due_date');
    table.timestamps(true, true);
    table.index('staff_id');
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('bookings');
  await knex.schema.dropTableIfExists('vendors');
  await knex.schema.dropTableIfExists('rooms');
  await knex.schema.dropTableIfExists('users');
};

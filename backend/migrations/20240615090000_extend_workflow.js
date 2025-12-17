export const up = async (knex) => {
  await knex.schema.alterTable('rooms', (table) => {
    table.integer('capacity').notNullable().defaultTo(1);
    table.text('amenities').defaultTo('[]');
  });

  await knex.schema.alterTable('bookings', (table) => {
    table.integer('guest_count').notNullable().defaultTo(1);
    table.string('requested_room_type');
    table.string('meal_package');
    table.text('addons').notNullable().defaultTo('[]');
    table.text('preferences');
    table.text('special_requests');
    table.decimal('extras_total', 10, 2).notNullable().defaultTo(0);
    table.string('payment_status').notNullable().defaultTo('pending');
    table.string('invoice_number');
    table.datetime('invoice_due_at');
    table.datetime('paid_at');
    table.text('cancel_reason');
  });

  await knex.schema.alterTable('vendors', (table) => {
    table.decimal('rate', 10, 2).defaultTo(0);
    table.string('phone');
    table.datetime('approved_at');
  });

  await knex.schema.createTable('service_requests', (table) => {
    table.increments('id').primary();
    table.integer('booking_id').unsigned().references('id').inTable('bookings').onDelete('CASCADE');
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('type').notNullable();
    table.text('details');
    table.datetime('preferred_time');
    table.string('status').notNullable().defaultTo('pending');
    table.integer('assigned_staff_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.text('notes');
    table.timestamps(true, true);
  });

  await knex.schema.alterTable('tasks', (table) => {
    table.string('department');
    table.string('task_type');
    table.string('priority').defaultTo('normal');
    table.integer('request_id').unsigned().references('id').inTable('service_requests').onDelete('SET NULL');
    table.decimal('vendor_fee', 10, 2).defaultTo(0);
  });

  await knex.schema.createTable('payments', (table) => {
    table.increments('id').primary();
    table.integer('booking_id').unsigned().references('id').inTable('bookings').onDelete('CASCADE');
    table.decimal('amount', 10, 2).notNullable();
    table.string('status').notNullable().defaultTo('pending');
    table.string('method').notNullable().defaultTo('card');
    table.string('transaction_ref');
    table.datetime('processed_at');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('reviews', (table) => {
    table.increments('id').primary();
    table.integer('booking_id').unsigned().references('id').inTable('bookings').onDelete('CASCADE');
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('rating').notNullable();
    table.text('comment');
    table.timestamps(true, true);
  });
};

export const down = async (knex) => {
  await knex.schema.alterTable('tasks', (table) => {
    table.dropColumn('department');
    table.dropColumn('task_type');
    table.dropColumn('priority');
    table.dropColumn('request_id');
    table.dropColumn('vendor_fee');
  });

  await knex.schema.dropTableIfExists('reviews');
  await knex.schema.dropTableIfExists('service_requests');
  await knex.schema.dropTableIfExists('payments');

  await knex.schema.alterTable('vendors', (table) => {
    table.dropColumn('rate');
    table.dropColumn('phone');
    table.dropColumn('approved_at');
  });

  await knex.schema.alterTable('bookings', (table) => {
    table.dropColumn('guest_count');
    table.dropColumn('requested_room_type');
    table.dropColumn('meal_package');
    table.dropColumn('addons');
    table.dropColumn('preferences');
    table.dropColumn('special_requests');
    table.dropColumn('extras_total');
    table.dropColumn('payment_status');
    table.dropColumn('invoice_number');
    table.dropColumn('invoice_due_at');
    table.dropColumn('paid_at');
    table.dropColumn('cancel_reason');
  });

  await knex.schema.alterTable('rooms', (table) => {
    table.dropColumn('capacity');
    table.dropColumn('amenities');
  });
};

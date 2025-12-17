require('dotenv').config();

const shared = {
  client: process.env.DB_CLIENT || 'sqlite3',
  connection: {
    filename: process.env.DB_FILENAME || './hotel.db',
  },
  useNullAsDefault: true,
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

module.exports = {
  development: shared,
  test: {
    ...shared,
    connection: {
      filename: process.env.TEST_DB_FILENAME || './hotel.test.db',
    },
  },
};

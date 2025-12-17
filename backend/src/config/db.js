import knex from 'knex';
import knexConfig from '../../knexfile.cjs';
import { config } from './index.js';

const env = config.env || 'development';

export const db = knex(knexConfig[env]);

export const initDb = async () => {
  try {
    await db.raw('select 1+1 as result');
    console.log('Database connection established');
  } catch (err) {
    console.error('Database connection failed', err.message);
    throw err;
  }
};

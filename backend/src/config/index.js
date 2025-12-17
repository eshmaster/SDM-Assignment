import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwt',
  env: process.env.NODE_ENV || 'development',
  paymentWindowMinutes: Number(process.env.PAYMENT_WINDOW_MINUTES || 30),
};

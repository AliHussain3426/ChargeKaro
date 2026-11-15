import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-charging',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Payments (P0): provider-agnostic config. "sandbox" uses internal signed test adapter.
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'sandbox',
  PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET || 'dev-payment-webhook-secret-change-in-production',
  PAYMENT_CURRENCY: process.env.PAYMENT_CURRENCY || 'PKR',
  // P0.4: platform commission is configurable (SRS commission/payout model pending confirmation).
  // Default preserves existing 10% behavior/tests; set explicitly per approved business policy.
  PLATFORM_COMMISSION_RATE: (() => {
    const v = Number(process.env.PLATFORM_COMMISSION_RATE ?? '0.1');
    return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.1;
  })(),
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
} as const;

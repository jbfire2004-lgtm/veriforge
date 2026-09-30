import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

export const env = {
  nodeEnv,
  port: Number(process.env.PORT ?? 3020),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  /** Optional rotation: "kid1:secret1,kid2:secret2" (first signs, all verify) */
  jwtAccessSecrets: process.env.JWT_ACCESS_SECRETS ?? '',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresDays: Number(process.env.JWT_REFRESH_EXPIRES_DAYS ?? 7),
  jwtIssuer: process.env.JWT_ISSUER ?? 'veriforge',
  jwtAudience: process.env.JWT_AUDIENCE ?? 'veriforge-app',
  fieldEncryptionKey: process.env.FIELD_ENCRYPTION_KEY ?? '',
  annualDiscountPercent: Number(process.env.ANNUAL_DISCOUNT_PERCENT ?? 17),
  trialDays: Number(process.env.TRIAL_DAYS ?? 7),
  currency: (process.env.CURRENCY ?? 'USD').toUpperCase(),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  platformAdminEmails: (process.env.PLATFORM_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'VeriForge <onboarding@veriforge.local>',
  appPublicUrl: (process.env.APP_PUBLIC_URL ?? 'http://localhost:5175').replace(/\/$/, ''),
  redisUrl: nodeEnv === 'test' ? '' : (process.env.REDIS_URL ?? ''),
  runCronInApi: process.env.RUN_CRON_IN_API === 'true',
  workerMode: process.env.WORKER_MODE === 'true',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  isProduction,
  enforceHttps: process.env.ENFORCE_HTTPS === 'true',
};

if (isProduction) {
  if (env.corsOrigin === '*') {
    throw new Error('CORS_ORIGIN=* is not allowed in production');
  }
  if (!env.fieldEncryptionKey || env.fieldEncryptionKey.length < 32) {
    throw new Error('FIELD_ENCRYPTION_KEY (min 32 chars) required in production');
  }
  if (env.jwtAccessSecret.length < 32 || env.jwtRefreshSecret.length < 32) {
    throw new Error('JWT secrets must be at least 32 characters in production');
  }
}

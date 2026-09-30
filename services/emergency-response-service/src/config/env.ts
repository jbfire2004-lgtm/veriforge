import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3017),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  authValidateUrl: process.env.AUTH_VALIDATE_URL,
  accessControlServiceUrl: process.env.ACCESS_CONTROL_SERVICE_URL,
  safetyStationsServiceUrl: process.env.SAFETY_STATIONS_SERVICE_URL,
  notificationWebhookUrl: process.env.NOTIFICATION_WEBHOOK_URL,
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};

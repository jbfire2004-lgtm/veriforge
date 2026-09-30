import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3003),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  auditServiceKey: process.env.AUDIT_SERVICE_KEY,
  authValidateUrl: process.env.AUTH_VALIDATE_URL,
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  defaultLimit: Number(process.env.AUDIT_DEFAULT_LIMIT ?? 50),
  maxLimit: Number(process.env.AUDIT_MAX_LIMIT ?? 200),
};

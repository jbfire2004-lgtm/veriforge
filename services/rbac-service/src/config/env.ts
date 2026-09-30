import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3002),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  permissionCacheTtlMs: Number(process.env.PERMISSION_CACHE_TTL_MS ?? 60_000),
  permissionCacheMaxEntries: Number(process.env.PERMISSION_CACHE_MAX_ENTRIES ?? 10_000),
  authValidateUrl: process.env.AUTH_VALIDATE_URL,
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};

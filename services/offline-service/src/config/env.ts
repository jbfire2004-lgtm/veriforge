import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3005),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  authValidateUrl: process.env.AUTH_VALIDATE_URL,
  validationHookUrl: process.env.VALIDATION_HOOK_URL,
  moduleApplyUrl: process.env.MODULE_APPLY_URL,
  syncWorkerEnabled: process.env.SYNC_WORKER_ENABLED !== 'false',
  syncWorkerIntervalMs: Number(process.env.SYNC_WORKER_INTERVAL_MS ?? 15_000),
  syncWorkerBatchSize: Number(process.env.SYNC_WORKER_BATCH_SIZE ?? 50),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};

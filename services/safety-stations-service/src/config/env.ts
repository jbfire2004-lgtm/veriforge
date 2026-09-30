import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3015),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  authValidateUrl: process.env.AUTH_VALIDATE_URL,
  workerSafetyServiceUrl: process.env.WORKER_SAFETY_SERVICE_URL,
  equipmentSafetyServiceUrl: process.env.EQUIPMENT_SAFETY_SERVICE_URL,
  jhaServiceUrl: process.env.JHA_SERVICE_URL,
  accessControlServiceUrl: process.env.ACCESS_CONTROL_SERVICE_URL,
  heartbeatStaleSeconds: Number(process.env.HEARTBEAT_STALE_SECONDS ?? 300),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};

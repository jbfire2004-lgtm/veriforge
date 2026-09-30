import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3030),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  authValidateUrl: process.env.AUTH_VALIDATE_URL,
  jhaServiceUrl: process.env.JHA_SERVICE_URL,
  trainingServiceUrl: process.env.TRAINING_SERVICE_URL,
  sdsServiceUrl: process.env.SDS_SERVICE_URL,
  hazardControlServiceUrl: process.env.HAZARD_CONTROL_SERVICE_URL,
  pmTaskServiceUrl: process.env.PM_TASK_SERVICE_URL,
  natsBridgeUrl: process.env.NATS_BRIDGE_URL,
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};

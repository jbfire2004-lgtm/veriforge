import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3028),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  authValidateUrl: process.env.AUTH_VALIDATE_URL,
  correctiveActionServiceUrl: process.env.CORRECTIVE_ACTION_SERVICE_URL,
  hazardControlServiceUrl: process.env.HAZARD_CONTROL_SERVICE_URL,
  equipmentSafetyServiceUrl: process.env.EQUIPMENT_SAFETY_SERVICE_URL,
  natsBridgeUrl: process.env.NATS_BRIDGE_URL,
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  defaultPassThreshold: Number(process.env.DEFAULT_PASS_THRESHOLD ?? 80),
};

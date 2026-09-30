import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3022),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  authValidateUrl: process.env.AUTH_VALIDATE_URL,
  defaultModelId: process.env.DEFAULT_MODEL_ID ?? 'deterministic_rules_v1',
  defaultModelVersion: Number(process.env.DEFAULT_MODEL_VERSION ?? 1),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};

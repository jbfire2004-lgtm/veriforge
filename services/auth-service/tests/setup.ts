process.env.NODE_ENV = 'test';
process.env.PORT = '3099';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_auth:vera_auth_secret@localhost:5433/vera_auth?schema=public';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-minimum-32-characters';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-minimum-32-characters';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_DAYS = '7';
process.env.BCRYPT_ROUNDS = '4';
process.env.LOG_LEVEL = 'error';
process.env.CORS_ORIGIN = '*';

process.env.NODE_ENV = 'test';
process.env.PORT = '3116';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_sds:vera_sds_secret@localhost:5448/vera_sds?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.EXPIRY_WARNING_DAYS = '30';
process.env.LOG_LEVEL = 'error';

process.env.NODE_ENV = 'test';
process.env.PORT = '3095';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_hazard:vera_hazard_secret@localhost:5438/vera_hazard?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

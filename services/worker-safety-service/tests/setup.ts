process.env.NODE_ENV = 'test';
process.env.PORT = '3101';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_worker:vera_worker_secret@localhost:5443/vera_worker?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

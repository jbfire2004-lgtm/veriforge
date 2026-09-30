process.env.NODE_ENV = 'test';
process.env.PORT = '3123';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_cail_score:vera_cail_score_secret@localhost:5455/vera_cail_score?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

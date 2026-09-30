process.env.NODE_ENV = 'test';
process.env.PORT = '3125';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_cail_recommend:vera_cail_recommend_secret@localhost:5457/vera_cail_recommend?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

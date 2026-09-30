process.env.NODE_ENV = 'test';
process.env.PORT = '3126';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_cail_explain:vera_cail_explain_secret@localhost:5458/vera_cail_explain?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

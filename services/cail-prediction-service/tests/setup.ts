process.env.NODE_ENV = 'test';
process.env.PORT = '3124';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_cail_predict:vera_cail_predict_secret@localhost:5456/vera_cail_predict?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

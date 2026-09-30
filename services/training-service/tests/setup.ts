process.env.NODE_ENV = 'test';
process.env.PORT = '3102';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_training:vera_training_secret@localhost:5444/vera_training?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

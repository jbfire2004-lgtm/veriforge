process.env.NODE_ENV = 'test';
process.env.PORT = '3132';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_cail_version:vera_cail_version_secret@localhost:5464/vera_cail_version?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.TRAINING_SERVICE_URL = 'http://localhost:3031/cail/train';
process.env.LOG_LEVEL = 'error';

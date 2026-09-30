process.env.NODE_ENV = 'test';
process.env.PORT = '3194';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_config:vera_config_secret@localhost:5466/vera_config?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

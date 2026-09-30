process.env.NODE_ENV = 'test';
process.env.PORT = '3119';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_work_package:vera_work_package_secret@localhost:5451/vera_work_package?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

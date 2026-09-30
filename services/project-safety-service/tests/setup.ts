process.env.NODE_ENV = 'test';
process.env.PORT = '3100';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_project:vera_project_secret@localhost:5442/vera_project?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

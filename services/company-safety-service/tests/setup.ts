process.env.NODE_ENV = 'test';
process.env.PORT = '3099';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_company:vera_company_secret@localhost:5441/vera_company?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

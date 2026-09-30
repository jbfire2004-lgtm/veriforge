process.env.NODE_ENV = 'test';
process.env.PORT = '3118';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_pm_project:vera_pm_project_secret@localhost:5450/vera_pm_project?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

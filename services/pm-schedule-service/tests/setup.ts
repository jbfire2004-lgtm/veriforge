process.env.NODE_ENV = 'test';
process.env.PORT = '3121';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_pm_schedule:vera_pm_schedule_secret@localhost:5453/vera_pm_schedule?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

process.env.NODE_ENV = 'test';
process.env.PORT = '3120';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_pm_task:vera_pm_task_secret@localhost:5452/vera_pm_task?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

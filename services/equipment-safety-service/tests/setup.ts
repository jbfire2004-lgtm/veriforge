process.env.NODE_ENV = 'test';
process.env.PORT = '3113';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_equipment:vera_equipment_secret@localhost:5445/vera_equipment?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

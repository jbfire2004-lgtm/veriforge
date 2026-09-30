process.env.NODE_ENV = 'test';
process.env.PORT = '3115';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_stations:vera_stations_secret@localhost:5447/vera_stations?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.HEARTBEAT_STALE_SECONDS = '300';
process.env.LOG_LEVEL = 'error';

process.env.NODE_ENV = 'test';
process.env.PORT = '3131';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://vera_cail_train:vera_cail_train_secret@localhost:5463/vera_cail_train?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.LOG_LEVEL = 'error';

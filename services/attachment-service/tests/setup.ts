process.env.NODE_ENV = 'test';
process.env.PORT = '3097';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://vera_attachment:vera_attachment_secret@localhost:5436/vera_attachment?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-characters';
process.env.STORAGE_DRIVER = 'local';
process.env.LOCAL_STORAGE_PATH = './data/test-uploads';
process.env.LOG_LEVEL = 'error';

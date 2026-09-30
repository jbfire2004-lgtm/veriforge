process.env.NODE_ENV = 'test';
delete process.env.REDIS_URL;
process.env.REDIS_DISABLED = 'true';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/veriforge_test';
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-min-32-characters!!';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-min-32-characters!';
process.env.JWT_ACCESS_SECRETS =
  process.env.JWT_ACCESS_SECRETS ??
  'v2:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb,v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
process.env.FIELD_ENCRYPTION_KEY =
  process.env.FIELD_ENCRYPTION_KEY ?? 'test-field-encryption-key-32chars!!';
process.env.FIELD_ENCRYPTION_OPTIONAL = 'false';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? 'sk_test_mock_key';
process.env.STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_test_mock_secret';
process.env.TRIAL_DAYS = process.env.TRIAL_DAYS ?? '7';
process.env.ANNUAL_DISCOUNT_PERCENT = process.env.ANNUAL_DISCOUNT_PERCENT ?? '17';

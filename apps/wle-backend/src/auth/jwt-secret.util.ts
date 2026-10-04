/**
 * Resolve JWT signing/verification secret.
 * Never fall back to a weak default when NODE_ENV=production.
 */
export function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required when NODE_ENV=production');
  }
  return 'dev_secret';
}

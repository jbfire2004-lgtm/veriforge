import * as argon2 from 'argon2';
import { BadRequestError } from '../utils/errors';

/** Strong password policy for production signup/login password changes. */
export function assertPasswordPolicy(password: string): void {
  if (password.length < 12) {
    throw new BadRequestError('Password must be at least 12 characters');
  }
  if (password.length > 128) {
    throw new BadRequestError('Password is too long');
  }
  if (!/[a-z]/.test(password)) {
    throw new BadRequestError('Password must include a lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    throw new BadRequestError('Password must include an uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    throw new BadRequestError('Password must include a digit');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new BadRequestError('Password must include a symbol');
  }
  const lowered = password.toLowerCase();
  for (const bad of ['password', 'veriforge', '123456', 'qwerty']) {
    if (lowered.includes(bad)) {
      throw new BadRequestError('Password is too common');
    }
  }
}

export async function hashPassword(password: string): Promise<string> {
  assertPasswordPolicy(password);
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  try {
    if (passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$')) {
      const bcrypt = await import('bcrypt');
      return bcrypt.compare(password, passwordHash);
    }
    return await argon2.verify(passwordHash, password);
  } catch {
    return false;
  }
}

export function needsRehash(passwordHash: string): boolean {
  return passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$');
}

import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

/** Dev/test seed only — never a production default. */
export const VERIFORGE_DEV_SEED_PASSWORD = 'Str0ng!Passw0rd';

export const VERIFORGE_REVIEWER_EMAIL = 'reviewer@alloy.works';
export const VERIFORGE_REVIEWER_DEFAULT_PASSWORD = 'Review!Only2026';

export function assertTenantPasswordPolicy(password: string): void {
  if (password.length < 12) {
    throw new BadRequestException('Password must be at least 12 characters');
  }
  if (password.length > 128) {
    throw new BadRequestException('Password is too long');
  }
  if (!/[a-z]/.test(password)) {
    throw new BadRequestException('Password must include a lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    throw new BadRequestException('Password must include an uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    throw new BadRequestException('Password must include a digit');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new BadRequestException('Password must include a symbol');
  }
}

export async function hashTenantPassword(password: string): Promise<string> {
  assertTenantPasswordPolicy(password);
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyTenantPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  if (!passwordHash || !passwordHash.startsWith('$2')) return false;
  try {
    return await bcrypt.compare(password, passwordHash);
  } catch {
    return false;
  }
}

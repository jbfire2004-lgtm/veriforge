import { BadRequestException } from '@nestjs/common';
import {
  assertTenantPasswordPolicy,
  hashTenantPassword,
  verifyTenantPassword,
  VERIFORGE_DEV_SEED_PASSWORD,
} from './tenant-password';

describe('tenant-password', () => {
  it('rejects passwords that miss policy', () => {
    expect(() => assertTenantPasswordPolicy('short')).toThrow(
      BadRequestException,
    );
    expect(() => assertTenantPasswordPolicy('noupperor1!')).toThrow(
      BadRequestException,
    );
  });

  it('hashes and verifies bcrypt', async () => {
    const hash = await hashTenantPassword(VERIFORGE_DEV_SEED_PASSWORD);
    expect(hash.startsWith('$2')).toBe(true);
    await expect(
      verifyTenantPassword(VERIFORGE_DEV_SEED_PASSWORD, hash),
    ).resolves.toBe(true);
    await expect(verifyTenantPassword('WrongPass1!!!!', hash)).resolves.toBe(
      false,
    );
    await expect(
      verifyTenantPassword(VERIFORGE_DEV_SEED_PASSWORD, 'forge-hash-alloy'),
    ).resolves.toBe(false);
  });
});

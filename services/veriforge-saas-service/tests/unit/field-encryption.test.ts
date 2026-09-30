import { describe, expect, it } from 'vitest';
import {
  decryptField,
  encryptField,
  isEncrypted,
  resolveDisplayName,
} from '../../src/security/field-encryption';

describe('field encryption', () => {
  it('round-trips AES-GCM and marks ciphertext', () => {
    const ct = encryptField('Jane Operator');
    expect(isEncrypted(ct)).toBe(true);
    expect(decryptField(ct)).toBe('Jane Operator');
  });

  it('prefers fullNameEnc for display', () => {
    const enc = encryptField('Encrypted Name');
    expect(
      resolveDisplayName({ fullName: 'Plain Name', fullNameEnc: enc }),
    ).toBe('Encrypted Name');
  });
});

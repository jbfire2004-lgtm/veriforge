import { describe, it, expect } from 'vitest';
import {
  createSecureDownloadToken,
  verifySecureDownloadToken,
} from '../../src/utils/secure-token';

describe('secure download token', () => {
  it('round-trips token payload', () => {
    const { token } = createSecureDownloadToken({
      attachmentId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      companyId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      kind: 'file',
      ttlSec: 60,
    });
    const payload = verifySecureDownloadToken(token);
    expect(payload.attachmentId).toBe('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    expect(payload.kind).toBe('file');
  });
});

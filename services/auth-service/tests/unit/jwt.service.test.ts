import { describe, it, expect } from 'vitest';
import { jwtService } from '../../src/services/jwt.service';

describe('jwtService', () => {
  const user = {
    id: '11111111-1111-1111-1111-111111111111',
    companyId: '22222222-2222-2222-2222-222222222222',
    email: 'test@example.com',
    roles: ['worker', 'supervisor'],
  };

  it('signs and verifies access token with required claims', () => {
    const { token, expiresIn } = jwtService.signAccessToken(user);
    expect(token).toBeTruthy();
    expect(expiresIn).toBeGreaterThan(0);

    const payload = jwtService.verifyAccessToken(token);
    expect(payload.user_id).toBe(user.id);
    expect(payload.company_id).toBe(user.companyId);
    expect(payload.email).toBe(user.email);
    expect(payload.roles).toEqual(user.roles);
  });

  it('rejects tampered token', () => {
    const { token } = jwtService.signAccessToken(user);
    expect(() => jwtService.verifyAccessToken(token + 'x')).toThrow();
  });
});

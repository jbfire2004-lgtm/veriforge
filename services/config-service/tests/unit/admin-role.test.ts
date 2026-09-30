import { describe, it, expect } from 'vitest';
import { hasAdminRole } from '../../src/middleware/auth.middleware';

describe('hasAdminRole', () => {
  it('returns true for admin roles', () => {
    expect(hasAdminRole(['admin'])).toBe(true);
    expect(hasAdminRole(['company_admin'])).toBe(true);
    expect(hasAdminRole(['Worker', 'ADMIN'])).toBe(true);
  });

  it('returns false for non-admin roles', () => {
    expect(hasAdminRole(['worker'])).toBe(false);
    expect(hasAdminRole(['supervisor'])).toBe(false);
    expect(hasAdminRole(undefined)).toBe(false);
  });
});

import { UserRole } from '@prisma/client';
import { roleSatisfiesAny } from './role-hierarchy';

describe('roleSatisfiesAny', () => {
  it('allows company admin to satisfy supervisor requirement', () => {
    expect(
      roleSatisfiesAny(UserRole.COMPANY_ADMIN, [UserRole.SUPERVISOR]),
    ).toBe(true);
  });

  it('denies worker for supervisor requirement', () => {
    expect(roleSatisfiesAny(UserRole.WORKER, [UserRole.SUPERVISOR])).toBe(
      false,
    );
  });

  it('allows exact role match', () => {
    expect(
      roleSatisfiesAny(UserRole.PROJECT_MANAGER, [UserRole.PROJECT_MANAGER]),
    ).toBe(true);
  });
});

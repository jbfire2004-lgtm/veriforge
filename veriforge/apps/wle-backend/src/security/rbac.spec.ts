import { UserRole } from '@prisma/client';
import { roleSatisfiesAny } from './role-hierarchy';
import { RBAC, rolesFor } from './rbac';

describe('RBAC capabilities', () => {
  it('allows supervisors to manage project compliance', () => {
    expect(
      roleSatisfiesAny(
        UserRole.SUPERVISOR,
        rolesFor('manageProjectCompliance'),
      ),
    ).toBe(true);
    expect(
      roleSatisfiesAny(
        UserRole.COMPANY_ADMIN,
        rolesFor('manageProjectCompliance'),
      ),
    ).toBe(true);
  });

  it('blocks workers from managing project compliance', () => {
    expect(
      roleSatisfiesAny(UserRole.WORKER, rolesFor('manageProjectCompliance')),
    ).toBe(false);
  });

  it('blocks workers from approving safety forms', () => {
    expect(
      roleSatisfiesAny(UserRole.WORKER, rolesFor('approveSafetyForms')),
    ).toBe(false);
  });

  it('allows workers to submit safety forms', () => {
    expect(
      roleSatisfiesAny(UserRole.WORKER, rolesFor('submitSafetyForms')),
    ).toBe(true);
  });

  it('blocks workers from credential ledger backfill', () => {
    expect(
      roleSatisfiesAny(UserRole.WORKER, rolesFor('credentialLedgerBackfill')),
    ).toBe(false);
  });

  it('allows instructors to issue credentials', () => {
    expect(
      roleSatisfiesAny(
        UserRole.TRAINING_INSTRUCTOR,
        rolesFor('issueCredentials'),
      ),
    ).toBe(true);
  });

  it('blocks workers from legacy provider API management', () => {
    expect(
      roleSatisfiesAny(UserRole.WORKER, rolesFor('manageProviderApis')),
    ).toBe(false);
  });

  it('exposes stable capability keys', () => {
    expect(Object.keys(RBAC).sort()).toEqual(
      [
        'approveSafetyForms',
        'credentialLedgerBackfill',
        'issueCredentials',
        'manageProjectCompliance',
        'manageProviderApis',
        'submitSafetyForms',
        'viewCredentialChain',
        'viewProjectCompliance',
      ].sort(),
    );
  });
});

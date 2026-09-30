import { describe, it, expect } from 'vitest';
import { evaluatePermission } from '../../src/engines/evaluation.engine';

describe('evaluation.engine', () => {
  const perms = [
    { id: '1', name: 'Read hazards', resource: 'hazard', action: 'read' },
    { id: '2', name: 'Admin all', resource: '*', action: '*' },
  ];

  it('allows exact match', () => {
    const r = evaluatePermission(perms, {
      userId: 'u',
      companyId: 'c',
      resource: 'hazard',
      action: 'read',
    });
    expect(r.allow).toBe(true);
  });

  it('denies missing permission', () => {
    const readOnly = [perms[0]];
    const r = evaluatePermission(readOnly, {
      userId: 'u',
      companyId: 'c',
      resource: 'hazard',
      action: 'delete',
    });
    expect(r.allow).toBe(false);
    expect(r.reason).toContain('No permission');
  });

  it('allows wildcard', () => {
    const r = evaluatePermission(perms, {
      userId: 'u',
      companyId: 'c',
      resource: 'incident',
      action: 'write',
    });
    expect(r.allow).toBe(true);
  });
});

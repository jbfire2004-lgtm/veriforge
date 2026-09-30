import { describe, it, expect } from 'vitest';
import { loadRoutes } from '../../src/config/routes';
import { actionFromMethod } from '../../src/utils/http-method-action';

describe('routes config', () => {
  it('loads routing table with expected prefixes', () => {
    const routes = loadRoutes();
    const prefixes = routes.map((r) => r.prefix);
    expect(prefixes).toContain('/auth');
    expect(prefixes).toContain('/rbac');
    expect(prefixes).toContain('/audit');
    expect(prefixes).toContain('/cail');
  });

  it('maps HTTP methods to RBAC actions', () => {
    expect(actionFromMethod('GET')).toBe('read');
    expect(actionFromMethod('POST')).toBe('create');
    expect(actionFromMethod('DELETE')).toBe('delete');
  });
});

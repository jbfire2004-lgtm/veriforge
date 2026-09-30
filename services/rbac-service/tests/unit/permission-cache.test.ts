import { describe, it, expect, beforeEach } from 'vitest';
import { permissionCache } from '../../src/cache/permission-cache';

describe('permissionCache', () => {
  beforeEach(() => permissionCache.clear());

  it('stores and retrieves permissions', () => {
    const perms = [{ id: '1', name: 'p', resource: 'a', action: 'b' }];
    permissionCache.set('c1', 'u1', perms);
    expect(permissionCache.get('c1', 'u1')).toEqual(perms);
  });

  it('invalidates user cache', () => {
    permissionCache.set('c1', 'u1', []);
    permissionCache.invalidateUser('c1', 'u1');
    expect(permissionCache.get('c1', 'u1')).toBeUndefined();
  });
});

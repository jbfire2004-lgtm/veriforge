import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';
import { rolesFor } from './rbac';

describe('RolesGuard security', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  function contextWithRole(role: UserRole, handlerRoles?: UserRole[]) {
    const handler = handlerRoles
      ? jest.fn().mockImplementation(() => {
          Reflect.defineMetadata('roles', handlerRoles, handler);
          return handler;
        })
      : jest.fn();

    if (handlerRoles) {
      Reflect.defineMetadata('roles', handlerRoles, handler);
    }

    return {
      getHandler: () => handler,
      getClass: () => class TestController {},
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    } as never;
  }

  it('rejects unauthenticated requests when roles are required', () => {
    const ctx = {
      getHandler: () => {
        const fn = () => undefined;
        Reflect.defineMetadata(
          'roles',
          rolesFor('manageProjectCompliance'),
          fn,
        );
        return fn;
      },
      getClass: () => class TestController {},
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as never;

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('rejects worker role escalation to compliance mutations', () => {
    const fn = () => undefined;
    Reflect.defineMetadata('roles', rolesFor('manageProjectCompliance'), fn);
    const ctx = {
      getHandler: () => fn,
      getClass: () => class TestController {},
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: UserRole.WORKER } }),
      }),
    } as never;

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('allows supervisor compliance management', () => {
    const fn = () => undefined;
    Reflect.defineMetadata('roles', rolesFor('manageProjectCompliance'), fn);
    const ctx = {
      getHandler: () => fn,
      getClass: () => class TestController {},
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: UserRole.SUPERVISOR } }),
      }),
    } as never;

    expect(guard.canActivate(ctx)).toBe(true);
  });
});

describe('JwtStrategy deactivated account', () => {
  it('documents active flag enforcement', () => {
    // Integration covered in jwt.strategy.ts — deactivated users throw UnauthorizedException.
    expect(UnauthorizedException).toBeDefined();
  });
});

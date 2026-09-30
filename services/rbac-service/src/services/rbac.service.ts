import { rbacRepository } from '../models/rbac.repository';
import { permissionCache } from '../cache/permission-cache';
import { evaluatePermission } from '../engines/evaluation.engine';
import { ConflictError, NotFoundError, ForbiddenError } from '../utils/errors';
import type { EvaluationInput, EvaluationResult } from '../types';
import { logger } from '../utils/logger';

export const rbacService = {
  async createRole(companyId: string, name: string) {
    try {
      const role = await rbacRepository.createRole(companyId, name);
      logger.info('role created', { roleId: role.id, companyId });
      return role;
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
        throw new ConflictError('Role name already exists for this company');
      }
      throw e;
    }
  },

  async createPermission(
    companyId: string,
    data: { name: string; resource: string; action: string },
  ) {
    try {
      const perm = await rbacRepository.createPermission(companyId, data);
      permissionCache.invalidateCompany(companyId);
      logger.info('permission created', { permissionId: perm.id, companyId });
      return perm;
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
        throw new ConflictError('Permission already exists for resource:action in this company');
      }
      throw e;
    }
  },

  async assignPermissionToRole(companyId: string, roleId: string, permissionId: string) {
    const role = await rbacRepository.findRole(roleId, companyId);
    if (!role) throw new NotFoundError('Role not found');

    const perm = await rbacRepository.findPermission(permissionId, companyId);
    if (!perm) throw new NotFoundError('Permission not found');

    const link = await rbacRepository.assignPermissionToRole(roleId, permissionId);
    permissionCache.invalidateCompany(companyId);
    return link;
  },

  async assignRoleToUser(companyId: string, userId: string, roleId: string) {
    const role = await rbacRepository.findRole(roleId, companyId);
    if (!role) throw new NotFoundError('Role not found');

    const assignment = await rbacRepository.assignRoleToUser(userId, roleId, companyId);
    permissionCache.invalidateUser(companyId, userId);
    logger.info('role assigned to user', { userId, roleId, companyId });
    return assignment;
  },

  /**
   * Auth service registration hook: assign roles by name from JWT role strings.
   */
  async assignRolesByName(
    companyId: string,
    userId: string,
    roleNames: string[],
  ): Promise<string[]> {
    const assigned: string[] = [];
    for (const name of roleNames) {
      let role = await rbacRepository.findRoleByName(companyId, name);
      if (!role) {
        try {
          role = await rbacRepository.createRole(companyId, name);
        } catch {
          role = await rbacRepository.findRoleByName(companyId, name);
        }
      }
      if (role) {
        await rbacRepository.assignRoleToUser(userId, role.id, companyId);
        assigned.push(name);
      }
    }
    permissionCache.invalidateUser(companyId, userId);
    return assigned;
  },

  async getUserPermissions(
    companyId: string,
    userId: string,
    useCache = true,
  ) {
    if (useCache) {
      const cached = permissionCache.get(companyId, userId);
      if (cached) {
        return { permissions: cached, cached: true };
      }
    }

    const permissions = await rbacRepository.getUserPermissions(companyId, userId);
    permissionCache.set(companyId, userId, permissions);
    const roles = await rbacRepository.listUserRoleIds(companyId, userId);
    return { permissions, roles, cached: false };
  },

  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    const { permissions } = await this.getUserPermissions(input.companyId, input.userId);
    return evaluatePermission(permissions, input);
  },

  assertCompanyAccess(requestCompanyId: string, resourceCompanyId: string) {
    if (requestCompanyId !== resourceCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },
};

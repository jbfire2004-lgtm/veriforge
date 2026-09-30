import { prisma } from '../db/prisma';
import type { PermissionRecord } from '../types';

export const rbacRepository = {
  async createRole(companyId: string, name: string) {
    return prisma.role.create({
      data: { companyId, name: name.trim() },
    });
  },

  async findRole(id: string, companyId?: string) {
    return prisma.role.findFirst({
      where: { id, ...(companyId ? { companyId } : {}) },
    });
  },

  async findRoleByName(companyId: string, name: string) {
    return prisma.role.findUnique({
      where: { companyId_name: { companyId, name: name.trim() } },
    });
  },

  async createPermission(
    companyId: string,
    data: { name: string; resource: string; action: string },
  ) {
    return prisma.permission.create({
      data: {
        companyId,
        name: data.name.trim(),
        resource: data.resource.trim().toLowerCase(),
        action: data.action.trim().toLowerCase(),
      },
    });
  },

  async findPermission(id: string, companyId?: string) {
    return prisma.permission.findFirst({
      where: { id, ...(companyId ? { companyId } : {}) },
    });
  },

  async assignPermissionToRole(roleId: string, permissionId: string) {
    return prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      create: { roleId, permissionId },
      update: {},
    });
  },

  async assignRoleToUser(userId: string, roleId: string, companyId: string) {
    return prisma.userRoleAssignment.upsert({
      where: { userId_roleId: { userId, roleId } },
      create: { userId, roleId, companyId },
      update: { companyId },
    });
  },

  async getUserPermissions(companyId: string, userId: string): Promise<PermissionRecord[]> {
    const rows = await prisma.userRoleAssignment.findMany({
      where: { userId, companyId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const map = new Map<string, PermissionRecord>();
    for (const ur of rows) {
      for (const rp of ur.role.permissions) {
        const p = rp.permission;
        map.set(p.id, {
          id: p.id,
          name: p.name,
          resource: p.resource,
          action: p.action,
        });
      }
    }
    return [...map.values()];
  },

  async listUserRoleIds(companyId: string, userId: string) {
    const rows = await prisma.userRoleAssignment.findMany({
      where: { userId, companyId },
      include: { role: true },
    });
    return rows.map((r) => ({ roleId: r.roleId, roleName: r.role.name }));
  },
};

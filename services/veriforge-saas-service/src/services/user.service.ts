import { randomBytes } from 'crypto';
import type { SystemRoleCode } from '@prisma/client';
import { prisma } from '../db/prisma';
import { ConflictError, NotFoundError } from '../utils/errors';
import { rbacService } from './rbac.service';
import { assertCanAssignRole } from '../security/tenant';
import { auditService } from './audit.service';
import type { InviteUserInput, SafeUser } from '../types';
import { logger } from '../utils/logger';
import { hashPassword } from '../security/password';
import { encryptField, resolveDisplayName } from '../security/field-encryption';

export class UserService {
  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });
  }

  async findByOrgAndEmail(orgId: string, email: string) {
    return prisma.user.findFirst({
      where: { orgId, email: email.toLowerCase() },
    });
  }

  async toSafeUser(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    const access = await rbacService.loadUserAccess(userId);
    return {
      id: user.id,
      orgId: user.orgId,
      email: user.email,
      fullName: resolveDisplayName(user),
      status: user.status,
      role: access.role,
      permissions: access.permissions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async invite(input: InviteUserInput): Promise<{ user: SafeUser; inviteToken: string }> {
    const actor = await this.toSafeUser(input.invitedByUserId);
    assertCanAssignRole(actor.role, input.role);

    const email = input.email.toLowerCase().trim();
    const existing = await this.findByOrgAndEmail(input.orgId, email);
    if (existing) throw new ConflictError('User already exists in this organization');

    // Temporary password until invite acceptance — still must meet policy
    const inviteToken = `${randomBytes(24).toString('base64url')}!A1`;
    const passwordHash = await hashPassword(inviteToken);
    const fullName = input.fullName.trim();

    const user = await prisma.user.create({
      data: {
        orgId: input.orgId,
        email,
        fullName,
        fullNameEnc: encryptField(fullName),
        passwordHash,
        status: 'invited',
      },
    });

    await rbacService.assignRole({
      orgId: input.orgId,
      userId: user.id,
      roleCode: input.role,
      assignedBy: input.invitedByUserId,
    });

    await auditService.log({
      action: 'rbac.role_assigned',
      orgId: input.orgId,
      actorId: input.invitedByUserId,
      resource: 'user',
      resourceId: user.id,
      meta: { role: input.role },
    });

    logger.info('user invited', { orgId: input.orgId, userId: user.id, role: input.role });
    return { user: await this.toSafeUser(user.id), inviteToken };
  }

  async listByOrg(orgId: string, opts?: { skip?: number; take?: number }) {
    const skip = opts?.skip ?? 0;
    const take = Math.min(opts?.take ?? 50, 200);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { orgId },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
        select: {
          id: true,
          orgId: true,
          email: true,
          fullName: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where: { orgId } }),
    ]);

    // Batch RBAC (cached) instead of unbounded N+1 over entire org
    const items = await Promise.all(users.map((u) => this.toSafeUser(u.id)));
    return { items, total, skip, take };
  }
}

export const userService = new UserService();

export type { SystemRoleCode };

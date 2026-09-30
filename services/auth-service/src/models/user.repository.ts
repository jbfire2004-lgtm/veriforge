import { Prisma, UserStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

export type CreateUserInput = {
  companyId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  roles: string[];
};

export const userRepository = {
  async findByCompanyAndEmail(companyId: string, email: string) {
    return prisma.user.findUnique({
      where: { companyId_email: { companyId, email: email.toLowerCase() } },
      include: { roles: true },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });
  },

  async create(input: CreateUserInput) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          companyId: input.companyId,
          email: input.email.toLowerCase(),
          passwordHash: input.passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          status: UserStatus.active,
        },
      });
      if (input.roles.length > 0) {
        await tx.userRoleAssignment.createMany({
          data: input.roles.map((role) => ({ userId: user.id, role })),
        });
      }
      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        include: { roles: true },
      });
    });
  },

  async updateRoles(userId: string, roles: string[]) {
    return prisma.$transaction(async (tx) => {
      await tx.userRoleAssignment.deleteMany({ where: { userId } });
      if (roles.length > 0) {
        await tx.userRoleAssignment.createMany({
          data: roles.map((role) => ({ userId, role })),
        });
      }
      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        include: { roles: true },
      });
    });
  },
};

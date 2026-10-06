import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectSafetyRoleType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectSafetyRoleService {
  constructor(private readonly prisma: PrismaService) {}

  listForProject(projectId: number) {
    return this.prisma.projectSafetyRole.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, username: true, email: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async upsert(input: {
    projectId: number;
    userId: number;
    role: ProjectSafetyRoleType;
    companyId?: number;
  }) {
    const project = await this.prisma.project.findUnique({
      where: { id: input.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.projectSafetyRole.upsert({
      where: {
        projectId_userId: {
          projectId: input.projectId,
          userId: input.userId,
        },
      },
      create: {
        projectId: input.projectId,
        userId: input.userId,
        companyId: input.companyId ?? user.companyId ?? undefined,
        role: input.role,
      },
      update: {
        role: input.role,
        companyId: input.companyId ?? user.companyId ?? undefined,
      },
      include: {
        user: { select: { id: true, username: true } },
        company: { select: { id: true, name: true } },
      },
    });
  }

  async remove(projectId: number, userId: number) {
    try {
      await this.prisma.projectSafetyRole.delete({
        where: { projectId_userId: { projectId, userId } },
      });
      return { ok: true };
    } catch {
      throw new NotFoundException('Project safety role not found');
    }
  }

  async rolesForUser(userId: number, projectId?: number) {
    return this.prisma.projectSafetyRole.findMany({
      where: {
        userId,
        ...(projectId ? { projectId } : {}),
      },
    });
  }
}

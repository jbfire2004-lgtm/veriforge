import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { isSuperAdmin, isSupervisor } from '../../vera-core/roles';
import { ApiException } from '../exceptions/api.exception';
import { ApiErrorCode } from '../constants/error-codes';
import { PROJECT_SCOPE_KEY } from '../decorators/scoped.decorator';

@Injectable()
export class ProjectScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const paramName =
      this.reflector.getAllAndOverride<string>(PROJECT_SCOPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'projectId';

    const request = context.switchToHttp().getRequest<{
      user?: { role?: string; companyId?: number };
      params?: Record<string, string>;
    }>();

    const user = request.user;
    if (!user?.role) {
      throw new ApiException(
        ApiErrorCode.UNAUTHORIZED,
        'Authentication required',
      );
    }

    const role = user.role as UserRole;
    if (isSuperAdmin(role) || isSupervisor(role)) {
      return true;
    }

    const projectId = Number(request.params?.[paramName]);
    if (!Number.isFinite(projectId)) return true;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { companyId: true },
    });

    if (!project) {
      throw new ApiException(ApiErrorCode.NOT_FOUND, 'Project not found', {
        projectId,
      });
    }

    if (user.companyId != null && project.companyId !== user.companyId) {
      throw new ApiException(
        ApiErrorCode.FORBIDDEN,
        'Access denied for this project',
        { projectId, companyId: project.companyId },
      );
    }

    return true;
  }
}

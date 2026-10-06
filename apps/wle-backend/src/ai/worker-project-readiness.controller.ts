import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { Permission } from '../security/security.types';
import { WorkerProjectReadinessService } from '../workers/worker-project-readiness.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/** Worker Project-Readiness Engine — daily work authorization for a project. */
@Controller('api/ai/worker')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class WorkerProjectReadinessController {
  constructor(private readonly readiness: WorkerProjectReadinessService) {}

  @Post('project-readiness')
  @HttpCode(200)
  evaluate(@Body() body: { workerId: number; projectId: number }) {
    return this.readiness.evaluate(body.workerId, body.projectId);
  }
}

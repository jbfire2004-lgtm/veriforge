import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { ProjectSafetyContextService } from './project-safety-context.service';
import { WorkerSafetyProfileService } from './worker-safety-profile.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety/context`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class SafetyContextController {
  constructor(
    private readonly projectContext: ProjectSafetyContextService,
    private readonly workerProfile: WorkerSafetyProfileService,
  ) {}

  @Get('project/:projectId')
  project(@Param('projectId') projectId: string) {
    return this.projectContext.getContext(parseInt(projectId, 10));
  }

  @Get('worker/:workerId')
  worker(
    @Param('workerId') workerId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.workerProfile.getProfile(
      parseInt(workerId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }
}

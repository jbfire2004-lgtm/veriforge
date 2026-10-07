import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { RequireModule } from '../acp/decorators/vera-access.decorator';
import { VeraModuleGuard } from '../acp/guards/vera-module.guard';
import { SafetySuiteService } from './safety-suite.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety-suite`)
@UseGuards(JwtAuthGuard, RolesGuard, VeraModuleGuard)
@Roles(...PM_ROLES)
@RequireModule('pm')
export class SafetySuiteController {
  constructor(private readonly safetySuite: SafetySuiteService) {}

  @Get('dashboard')
  dashboard(
    @Query('projectId') projectId: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.safetySuite.getDashboard(
      parseInt(projectId, 10),
      companyId ? parseInt(companyId, 10) : undefined,
    );
  }

  @Get('alerts')
  alerts(
    @Query('projectId') projectId: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.safetySuite.getAlerts(
      parseInt(projectId, 10),
      companyId ? parseInt(companyId, 10) : undefined,
    );
  }

  @Get('readiness')
  readiness(@Query('projectId') projectId: string) {
    return this.safetySuite.getReadiness(parseInt(projectId, 10));
  }

  @Get('energy-wheel')
  energyWheel() {
    return this.safetySuite.energyWheel();
  }

  @Get('libraries')
  libraries(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.safetySuite.getLibraries(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }
}

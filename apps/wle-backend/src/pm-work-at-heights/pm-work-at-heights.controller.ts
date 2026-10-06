import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmWorkAtHeightsService } from './pm-work-at-heights.service';

const ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.CONTRACTOR_ADMIN,
  UserRole.CONTRACTOR_USER,
];

@Controller(`${API_V1_PREFIX}/pm/work-at-heights`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ROLES)
export class PmWorkAtHeightsController {
  constructor(private readonly wah: PmWorkAtHeightsService) {}

  @Get('hub')
  hub(
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
    @Query('industry') industry?: string,
  ) {
    return this.wah.getHub(
      Number(companyId ?? 1),
      Number(projectId ?? 1),
      industry,
    );
  }

  @Get('industries')
  industries() {
    return this.wah.listPlaybooks();
  }

  @Get('industries/:id')
  industry(@Param('id') id: string) {
    return this.wah.getPlaybook(id);
  }
}

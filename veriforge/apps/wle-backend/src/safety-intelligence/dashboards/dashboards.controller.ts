import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { VsiDashboardsService } from './dashboards.service';
import { CailScopeService } from '../cail/cail-scope.service';
import { PredictiveRiskService } from '../predictive/predictive-risk.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety-intelligence/dashboards`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class VsiDashboardsController {
  constructor(
    private readonly dashboards: VsiDashboardsService,
    private readonly scope: CailScopeService,
    private readonly predictive: PredictiveRiskService,
  ) {}

  @Get('project/:projectId/revision')
  revision(@Param('projectId') projectId: string) {
    return this.dashboards.getRevision(parseInt(projectId, 10));
  }

  @Get('project/:projectId')
  async project(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.dashboards.projectDashboard(parseInt(projectId, 10), actor);
  }

  @Get('company')
  async company(
    @Req() req: { user: { id: number; role: UserRole } },
    @Query('ownerCompanyId') ownerCompanyId?: string,
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    const companyId = ownerCompanyId
      ? parseInt(ownerCompanyId, 10)
      : actor.companyId;
    if (!companyId) return { total: 0, overdue: 0, byProject: [] };
    return this.dashboards.companyDashboard(companyId, actor);
  }

  @Get('project/:projectId/predictive-risk')
  async predictiveRisk(@Param('projectId') projectId: string) {
    const id = parseInt(projectId, 10);
    const latest = await this.predictive.latestSnapshot(id);
    return (
      latest ?? { projectId: id, message: 'No snapshot yet; run compute.' }
    );
  }

  @Post('project/:projectId/predictive-risk/compute')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PROJECT_MANAGER)
  async computePredictiveRisk(@Param('projectId') projectId: string) {
    return this.predictive.computeAndStore(parseInt(projectId, 10));
  }
}

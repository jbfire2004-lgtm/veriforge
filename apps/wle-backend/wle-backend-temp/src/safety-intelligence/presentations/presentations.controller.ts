import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { CailScopeService } from '../cail/cail-scope.service';
import { VsiPresentationsService } from './presentations.service';

const PM_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety-intelligence/presentations`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class VsiPresentationsController {
  constructor(
    private readonly presentations: VsiPresentationsService,
    private readonly scope: CailScopeService,
  ) {}

  @Post('generate/project/:projectId')
  async generate(
    @Param('projectId') projectId: string,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.presentations.generateProjectBrief(
      parseInt(projectId, 10),
      actor,
    );
  }
}

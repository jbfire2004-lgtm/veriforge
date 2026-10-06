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
import { CailScopeService } from '../cail/cail-scope.service';
import { LessonsLearnedService } from './lessons-learned.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety-intelligence/lessons-learned`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class LessonsLearnedController {
  constructor(
    private readonly lessons: LessonsLearnedService,
    private readonly scope: CailScopeService,
  ) {}

  @Get()
  async list(
    @Req() req: { user: { id: number; role: UserRole } },
    @Query('projectId') projectId?: string,
    @Query('companyId') companyId?: string,
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.lessons.list(actor, {
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      companyId: companyId ? parseInt(companyId, 10) : undefined,
    });
  }

  @Get('clusters')
  async clusters(@Query('projectId') projectId: string) {
    return this.lessons.clusters(parseInt(projectId, 10));
  }

  @Post('recluster')
  async recluster(
    @Query('projectId') projectId: string,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.lessons.recluster(parseInt(projectId, 10), actor);
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.lessons.getById(id, actor);
  }

  @Post('from-cail/:cailId')
  async fromCail(@Param('cailId') cailId: string) {
    return this.lessons.materializeFromCail(cailId);
  }
}

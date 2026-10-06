import {
  Body,
  Controller,
  Get,
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
import { BboService } from './bbo.service';
import { CreateBboDto } from '../dto/create-bbo.dto';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety-intelligence/bbo`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class BboController {
  constructor(
    private readonly bbo: BboService,
    private readonly scope: CailScopeService,
  ) {}

  @Get()
  async list(
    @Req() req: { user: { id: number; role: UserRole } },
    @Query('projectId') projectId?: string,
    @Query('polarity') polarity?: string,
    @Query('behaviorCategory') behaviorCategory?: string,
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.bbo.list(actor, {
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      polarity,
      behaviorCategory,
    });
  }

  @Get('metrics')
  async metrics(@Query('projectId') projectId: string) {
    return this.bbo.getMetrics(parseInt(projectId, 10));
  }

  @Post()
  async create(
    @Body() dto: CreateBboDto,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.bbo.create(dto, actor);
  }
}

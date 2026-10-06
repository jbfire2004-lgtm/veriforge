import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CailStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { CailService } from './cail.service';
import { CailScopeService } from './cail-scope.service';
import { CreateCailDto } from '../dto/create-cail.dto';
import { UpdateCailDto } from '../dto/update-cail.dto';
import { ResolveCailDto } from '../dto/resolve-cail.dto';
import { AssignCailDto } from '../dto/assign-cail.dto';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety-intelligence/cail`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class CailController {
  constructor(
    private readonly cail: CailService,
    private readonly scope: CailScopeService,
  ) {}

  private async actor(req: { user: { id: number; role: UserRole } }) {
    return this.scope.resolveActor(req.user.id, req.user.role);
  }

  @Get()
  async list(
    @Req() req: { user: { id: number; role: UserRole } },
    @Query('projectId') projectId?: string,
    @Query('status') status?: CailStatus,
    @Query('sourceType') sourceType?: string,
    @Query('ownerCompanyId') ownerCompanyId?: string,
  ) {
    const actor = await this.actor(req);
    return this.cail.list(actor, {
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      status,
      sourceType,
      ownerCompanyId: ownerCompanyId ? parseInt(ownerCompanyId, 10) : undefined,
    });
  }

  @Get('workflow')
  getWorkflow() {
    return this.cail.getWorkflowDefinition();
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.actor(req);
    return this.cail.getById(id, actor);
  }

  @Post()
  async create(
    @Body() dto: CreateCailDto,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.actor(req);
    return this.cail.create(dto, actor);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCailDto,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.actor(req);
    return this.cail.update(id, dto, actor);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body() dto: AssignCailDto,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.actor(req);
    return this.cail.assign(id, dto, actor);
  }

  @Post(':id/resolve')
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveCailDto,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.actor(req);
    return this.cail.resolve(id, dto, actor);
  }

  @Post(':id/verify')
  async verify(
    @Param('id') id: string,
    @Body('note') note: string | undefined,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.actor(req);
    return this.cail.verify(id, actor, note);
  }

  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string | undefined,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.actor(req);
    return this.cail.cancel(id, actor, reason);
  }

  @Post(':id/ai/analyze')
  async analyzeAi(
    @Param('id') id: string,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.actor(req);
    return this.cail.analyzeWithAi(id, actor);
  }
}

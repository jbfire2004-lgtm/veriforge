import {
  Body,
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
import { SafetyInspectionsService } from './inspections.service';
import { CreateSafetyInspectionDto } from '../dto/create-safety-inspection.dto';
import { CreateInspectionItemDto } from '../dto/create-inspection-item.dto';
import { ClassifyPhotoDto } from '../dto/classify-photo.dto';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety-intelligence/inspections`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class SafetyInspectionsController {
  constructor(
    private readonly inspections: SafetyInspectionsService,
    private readonly scope: CailScopeService,
  ) {}

  @Get()
  async list(
    @Req() req: { user: { id: number; role: UserRole } },
    @Query('projectId') projectId?: string,
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.inspections.list(
      actor,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.inspections.getById(id, actor);
  }

  @Post()
  async create(
    @Body() dto: CreateSafetyInspectionDto,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.inspections.create(dto, actor);
  }

  @Post('ai/classify-photo')
  async aiSuggest(@Body() dto: ClassifyPhotoDto) {
    return this.inspections.classifyPhoto(dto);
  }

  @Post(':id/items')
  async addItem(
    @Param('id') id: string,
    @Body() dto: CreateInspectionItemDto,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.inspections.addItem(id, dto, actor);
  }

  @Post(':id/complete')
  async complete(
    @Param('id') id: string,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.inspections.complete(id, actor);
  }
}

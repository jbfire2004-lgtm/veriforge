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
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../config/routes';
import { CailScopeService } from '../cail/cail-scope.service';
import { IncidentsVsiService } from './incidents-vsi.service';
import {
  BulkIncidentCapaDto,
  OpenIncidentInvestigationDto,
  UpdateIncidentInvestigationDto,
} from '../dto/incident-investigation.dto';

const PM_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/safety-intelligence/incidents`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class IncidentsVsiController {
  constructor(
    private readonly incidents: IncidentsVsiService,
    private readonly scope: CailScopeService,
  ) {}

  @Get()
  async list(
    @Query('companyId') companyId?: string,
    @Query('siteId') siteId?: string,
    @Query('status') status?: string,
  ) {
    return this.incidents.listIncidents({
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      siteId: siteId ? parseInt(siteId, 10) : undefined,
      status,
    });
  }

  @Post(':id/investigation')
  async open(
    @Param('id') id: string,
    @Body() dto: OpenIncidentInvestigationDto,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.incidents.openInvestigation(parseInt(id, 10), dto, actor);
  }

  @Get(':id/investigation')
  async getInvestigation(@Param('id') id: string) {
    return this.incidents.getInvestigation(parseInt(id, 10));
  }

  @Patch(':id/investigation')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateIncidentInvestigationDto,
  ) {
    return this.incidents.updateInvestigation(parseInt(id, 10), dto);
  }

  @Post(':id/investigation/ai-pack')
  async aiPack(@Param('id') id: string) {
    return this.incidents.generateAiPack(parseInt(id, 10));
  }

  @Post(':id/corrective-actions')
  async bulkCapa(
    @Param('id') id: string,
    @Body() dto: BulkIncidentCapaDto,
    @Req() req: { user: { id: number; role: UserRole } },
  ) {
    const actor = await this.scope.resolveActor(req.user.id, req.user.role);
    return this.incidents.bulkCreateCapa(parseInt(id, 10), dto, actor);
  }

  @Get(':id/cail')
  async listCail(@Param('id') id: string) {
    return this.incidents.listCailForIncident(parseInt(id, 10));
  }
}

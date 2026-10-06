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
import {
  PmUnifiedControlType,
  PmUnifiedHcIngestSource,
  PmUnifiedHazardScope,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmUnifiedHazardControlService } from './pm-unified-hazard-control.service';
import { PmUnifiedHazardControlCailService } from './pm-unified-hazard-control-cail.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

const SUPERVISOR_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

@Controller(`${API_V1_PREFIX}/pm/unified-hazard-control`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmUnifiedHazardControlController {
  constructor(
    private readonly hc: PmUnifiedHazardControlService,
    private readonly cail: PmUnifiedHazardControlCailService,
  ) {}

  @Get('dashboard')
  dashboard(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.hc.getDashboard({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('analytics')
  analytics(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.hc.getAnalytics({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('hazards/:id')
  getHazardById(@Param('id') id: string) {
    return this.hc.getHazard(id);
  }

  @Get('controls/:id')
  getControlById(@Param('id') id: string) {
    return this.hc.getControl(id);
  }

  @Get('hazards')
  listHazards(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('scopeLevel') scopeLevel?: PmUnifiedHazardScope,
    @Query('status') status?: string,
  ) {
    return this.hc.listHazards({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      scopeLevel,
      status,
    });
  }

  @Post('hazards')
  @Roles(...SUPERVISOR_ROLES)
  createHazard(
    @Query('companyId') companyId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.hc.createHazard(
      parseInt(companyId, 10),
      body as Parameters<PmUnifiedHazardControlService['createHazard']>[1],
      req.user.id,
    );
  }

  @Post('hazards/:id/publish')
  @Roles(...SUPERVISOR_ROLES)
  publishHazard(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.hc.publishHazard(id, req.user.id);
  }

  @Post('hazards/:id/sif-heca')
  scoreSif(@Param('id') id: string) {
    return this.hc.scoreHazardSifHeca(id);
  }

  @Get('hazards/:id/energy-wheel')
  energyWheel(@Param('id') id: string) {
    return this.hc.getEnergyWheel(id);
  }

  @Get('hazards/:id/suggest-controls')
  suggestControls(@Param('id') id: string) {
    return this.hc.suggestControlsForHazard(id);
  }

  @Post('hazards/:id/apply-suggestions')
  @Roles(...SUPERVISOR_ROLES)
  applySuggestions(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.hc.applySuggestedControls(id, req.user.id);
  }

  @Get('controls')
  listControls(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('controlType') controlType?: PmUnifiedControlType,
  ) {
    return this.hc.listControls({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      controlType,
    });
  }

  @Post('controls')
  @Roles(...SUPERVISOR_ROLES)
  createControl(
    @Query('companyId') companyId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.hc.createControl(
      parseInt(companyId, 10),
      body as Parameters<PmUnifiedHazardControlService['createControl']>[1],
      req.user.id,
    );
  }

  @Post('controls/:id/publish')
  @Roles(...SUPERVISOR_ROLES)
  publishControl(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.hc.publishControl(id, req.user.id);
  }

  @Post('mapping')
  @Roles(...SUPERVISOR_ROLES)
  linkMapping(
    @Body()
    body: { hazardId: string; controlId: string; effectivenessScore?: number },
    @Req() req: { user: { id: number } },
  ) {
    return this.hc.linkHazardControl(
      body.hazardId,
      body.controlId,
      body.effectivenessScore,
      req.user.id,
    );
  }

  @Post('ingest')
  @Roles(...SUPERVISOR_ROLES)
  ingest(
    @Query('companyId') companyId: string,
    @Query('source') source: PmUnifiedHcIngestSource,
    @Query('projectId') projectId: string | undefined,
    @Req() req: { user: { id: number } },
  ) {
    return this.hc.ingestBatch(
      parseInt(companyId, 10),
      source,
      projectId ? parseInt(projectId, 10) : undefined,
      req.user.id,
    );
  }

  @Post('sync/company-to-project')
  @Roles(...SUPERVISOR_ROLES)
  syncInheritance(
    @Body() body: { companyId: number; projectId: number },
    @Req() req: { user: { id: number } },
  ) {
    return this.hc.syncCompanyToProject(
      body.companyId,
      body.projectId,
      req.user.id,
    );
  }

  @Post('enforcement/evaluate')
  enforcement(
    @Body() body: { companyId: number; projectId?: number; workerId?: number },
  ) {
    return this.hc.enforcementGate(body);
  }

  @Post('workers/:workerId/exposure/:hazardId')
  recordExposure(
    @Param('workerId') workerId: string,
    @Param('hazardId') hazardId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.hc.recordWorkerExposure(
      parseInt(workerId, 10),
      hazardId,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Post('attachments')
  addAttachment(@Body() body: Record<string, unknown>) {
    return this.hc.addAttachment(
      body as Parameters<PmUnifiedHazardControlService['addAttachment']>[0],
    );
  }

  @Get('sync')
  offlineBundle(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.hc.buildOfflineBundle({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Post('sync')
  offlineSyncUpload(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId: string | undefined,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.hc.applyOfflineSync(
      {
        companyId: parseInt(companyId, 10),
        projectId: projectId ? parseInt(projectId, 10) : undefined,
      },
      body as Parameters<PmUnifiedHazardControlService['applyOfflineSync']>[1],
      req.user.id,
    );
  }

  @Get('cail/bundle')
  cailBundle(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.hc.getCailBundle({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('cail/insights')
  cailInsights(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.cail.insights({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }
}

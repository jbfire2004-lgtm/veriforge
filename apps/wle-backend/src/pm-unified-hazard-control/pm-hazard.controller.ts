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
import { PmUnifiedHcIngestSource, UserRole } from '@prisma/client';
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

/** Spec-aligned alias: `/api/v1/pm/hazard` */
@Controller(`${API_V1_PREFIX}/pm/hazard`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmHazardController {
  constructor(
    private readonly hc: PmUnifiedHazardControlService,
    private readonly cail: PmUnifiedHazardControlCailService,
  ) {}

  @Post()
  @Roles(...SUPERVISOR_ROLES)
  createHazard(
    @Body() body: { companyId: number } & Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    const { companyId, ...data } = body;
    return this.hc.createHazard(
      companyId,
      data as Parameters<PmUnifiedHazardControlService['createHazard']>[1],
      req.user.id,
    );
  }

  @Post('ingest')
  @Roles(...SUPERVISOR_ROLES)
  ingest(
    @Body()
    body: {
      companyId: number;
      source: PmUnifiedHcIngestSource;
      projectId?: number;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.hc.ingestBatch(
      body.companyId,
      body.source,
      body.projectId,
      req.user.id,
    );
  }

  @Post('map-controls')
  @Roles(...SUPERVISOR_ROLES)
  mapControls(
    @Body()
    body: {
      hazardId: string;
      controlId: string;
      effectivenessScore?: number;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.hc.linkHazardControl(
      body.hazardId,
      body.controlId,
      body.effectivenessScore,
      req.user.id,
    );
  }

  @Post('sif-heca')
  scoreSif(@Body() body: { hazardId: string }) {
    return this.hc.scoreHazardSifHeca(body.hazardId);
  }

  @Post('offline/sync')
  offlineSync(
    @Body()
    body: {
      companyId: number;
      projectId?: number;
      hazards?: Array<Record<string, unknown>>;
      controls?: Array<Record<string, unknown>>;
      mappings?: Array<{
        hazardId: string;
        controlId: string;
        effectivenessScore?: number;
      }>;
    },
    @Req() req: { user: { id: number } },
  ) {
    const { companyId, projectId, ...payload } = body;
    return this.hc.applyOfflineSync(
      { companyId, projectId },
      payload,
      req.user.id,
    );
  }

  @Get(':id/energy-wheel')
  energyWheel(@Param('id') id: string) {
    return this.hc.getEnergyWheel(id);
  }

  @Get(':id/suggest-controls')
  suggestControls(@Param('id') id: string) {
    return this.hc.suggestControlsForHazard(id);
  }

  @Post(':id/publish')
  @Roles(...SUPERVISOR_ROLES)
  publish(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.hc.publishHazard(id, req.user.id);
  }

  @Get(':id/cail')
  hazardCail(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.hc.getHazard(id).then((hazard) =>
      Promise.all([
        this.hc.scoreHazardSifHeca(id),
        this.hc.suggestControlsForHazard(id),
        this.cail.insights({
          companyId: parseInt(companyId, 10) || hazard.companyId,
          projectId: projectId
            ? parseInt(projectId, 10)
            : hazard.projectId ?? undefined,
        }),
      ]).then(([sifHeca, suggestions, insights]) => ({
        hazardId: id,
        sifHeca,
        suggestions,
        insights,
      })),
    );
  }

  @Get(':id')
  getHazard(@Param('id') id: string) {
    return this.hc.getHazard(id);
  }
}

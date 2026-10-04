import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  PmAccessOverrideType,
  PmAccessPointType,
  PmAccessZoneType,
  UserRole,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmSiteAccessControlService } from './pm-site-access-control.service';
import { PmSiteAccessCailIntelligenceService } from './pm-site-access-cail-intelligence.service';

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

@Controller(`${API_V1_PREFIX}/pm/site-access-control`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmSiteAccessControlController {
  constructor(
    private readonly access: PmSiteAccessControlService,
    private readonly cail: PmSiteAccessCailIntelligenceService,
  ) {}

  @Post('validate')
  validate(
    @Body()
    body: {
      workerId: number;
      projectId: number;
      zoneCode?: string;
      equipmentId?: number;
      accessPointId?: string;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.access.validateAccess({
      ...body,
      actorId: req.user.id,
      recordAttempt: true,
    });
  }

  @Get('access-points')
  listPoints(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.access.listAccessPoints(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Post('access-points')
  @Roles(...SUPERVISOR_ROLES)
  createPoint(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.access.createAccessPoint(
      body as Parameters<PmSiteAccessControlService['createAccessPoint']>[0],
      req.user.id,
    );
  }

  @Get('zone-rules')
  listRules(@Query('projectId') projectId: string) {
    return this.access.listZoneRules(parseInt(projectId, 10));
  }

  @Post('zone-rules')
  @Roles(...SUPERVISOR_ROLES)
  upsertRule(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.access.upsertZoneRule(
      body as Parameters<PmSiteAccessControlService['upsertZoneRule']>[0],
      req.user.id,
    );
  }

  @Post('overrides')
  @Roles(...SUPERVISOR_ROLES)
  createOverride(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.access.createOverride(
      body as Parameters<PmSiteAccessControlService['createOverride']>[0],
      req.user.id,
    );
  }

  @Get('overrides')
  listOverrides(@Query('projectId') projectId: string) {
    return this.access.listOverrides(parseInt(projectId, 10));
  }

  @Post('overrides/:id/revoke')
  @Roles(...SUPERVISOR_ROLES)
  revokeOverride(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
  ) {
    return this.access.revokeOverride(id, req.user.id);
  }

  @Get('analytics/project/:projectId')
  analytics(@Param('projectId') projectId: string) {
    return this.access.analytics(parseInt(projectId, 10));
  }

  @Get('intelligence/project/:projectId')
  intelligence(@Param('projectId') projectId: string) {
    return this.cail.projectInsights(parseInt(projectId, 10));
  }

  @Get('sync/project/:projectId')
  syncBundle(@Param('projectId') projectId: string) {
    return this.access.syncBundle(parseInt(projectId, 10));
  }

  @Post('station/validate')
  stationValidate(@Body() body: Record<string, unknown>) {
    return this.access.stationValidate(
      body as {
        workerId: number;
        projectId: number;
        zoneCode?: string;
        equipmentId?: number;
      },
    );
  }

  @Post('offline/sync')
  offlineSync(
    @Body()
    body: {
      projectId: number;
      attempts?: Array<Record<string, unknown>>;
      overrides?: Array<Record<string, unknown>>;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.access.applyOfflineSync(
      body.projectId,
      body as unknown as Parameters<
        PmSiteAccessControlService['applyOfflineSync']
      >[1],
      req.user.id,
    );
  }
}

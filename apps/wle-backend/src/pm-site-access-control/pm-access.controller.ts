import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
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

/** Spec-aligned alias: `/api/v1/pm/access` */
@Controller(`${API_V1_PREFIX}/pm/access`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmAccessController {
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
    return this.access
      .validateAccess({
        ...body,
        actorId: req.user.id,
        recordAttempt: true,
      })
      .then((r) => ({
        ...r,
        result: this.access.mapSpecResult(r.decision),
        workflowState: this.access.mapWorkflowState(r.decision, !!r.overrideId),
      }));
  }

  @Post('override')
  @Roles(...SUPERVISOR_ROLES)
  override(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.access.createOverride(
      body as Parameters<PmSiteAccessControlService['createOverride']>[0],
      req.user.id,
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

  @Get('worker/:id')
  workerProfile(
    @Param('id', ParseIntPipe) id: number,
    @Query('projectId') projectId: string,
  ) {
    return this.access.getWorkerAccessProfile(id, parseInt(projectId, 10));
  }

  @Get('worker/:id/predict')
  workerPredict(
    @Param('id', ParseIntPipe) id: number,
    @Query('projectId') projectId: string,
  ) {
    return this.cail.predictAccessDenial(id, parseInt(projectId, 10));
  }

  @Get('equipment/:id')
  equipmentProfile(
    @Param('id', ParseIntPipe) id: number,
    @Query('projectId') projectId: string,
  ) {
    return this.access.getEquipmentAccessProfile(id, parseInt(projectId, 10));
  }

  @Get('equipment/:id/predict')
  equipmentPredict(@Param('id', ParseIntPipe) id: number) {
    return this.cail.predictEquipmentRisk(id);
  }
}

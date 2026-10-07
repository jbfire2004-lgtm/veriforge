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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmEmergencyResponseService } from './pm-emergency-response.service';
import { PmEmergencyCailIntelligenceService } from './pm-emergency-cail-intelligence.service';

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

/** Spec-aligned alias: `/api/v1/pm/emergency` */
@Controller(`${API_V1_PREFIX}/pm/emergency`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmEmergencyController {
  constructor(
    private readonly emergency: PmEmergencyResponseService,
    private readonly cail: PmEmergencyCailIntelligenceService,
  ) {}

  @Post('offline/sync')
  offlineSync(
    @Body()
    body: {
      projectId: number;
      checkins?: Array<Record<string, unknown>>;
      events?: Array<Record<string, unknown>>;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.emergency.applyOfflineSync(
      body.projectId,
      body as unknown as Parameters<typeof this.emergency.applyOfflineSync>[1],
      req.user.id,
    );
  }

  @Post('plan')
  @Roles(...SUPERVISOR_ROLES)
  createPlan(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.emergency.createPlan(
      body as Parameters<PmEmergencyResponseService['createPlan']>[0],
      req.user.id,
    );
  }

  @Post('equipment')
  @Roles(...SUPERVISOR_ROLES)
  createEquipment(@Body() body: Record<string, unknown>) {
    return this.emergency.createEmergencyEquipment(
      body as Parameters<
        PmEmergencyResponseService['createEmergencyEquipment']
      >[0],
    );
  }

  @Post('declare')
  @Roles(...SUPERVISOR_ROLES)
  declare(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.emergency.declareEmergency(
      body as Parameters<PmEmergencyResponseService['declareEmergency']>[0],
      req.user.id,
    );
  }

  @Get(':id/status')
  status(@Param('id') id: string) {
    return this.emergency.getEventStatus(id);
  }

  @Get(':id/predict')
  predict(@Param('id') id: string) {
    return this.cail.predictEmergencyRisk(id);
  }

  @Post(':id/all_clear')
  @Roles(...SUPERVISOR_ROLES)
  allClear(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
    @Body() body?: { force?: boolean },
  ) {
    return this.emergency.allClearEmergency(id, req.user.id, body?.force);
  }

  @Post(':id/close')
  @Roles(...SUPERVISOR_ROLES)
  close(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
    @Body() body?: { force?: boolean },
  ) {
    return this.emergency.closeEmergency(id, req.user.id, body?.force);
  }

  @Post(':id/muster/start')
  @Roles(...SUPERVISOR_ROLES)
  startMuster(
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.emergency.startMusterForEvent(
      id,
      body as Record<string, unknown>,
      req.user.id,
    );
  }

  @Post(':id/muster/checkin')
  checkIn(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.emergency.musterCheckInForEvent(id, body as never);
  }
}

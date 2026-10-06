import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmEquipmentSafetyService } from './pm-equipment-safety.service';
import { PmEquipmentCailIntelligenceService } from './pm-equipment-cail-intelligence.service';

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

/** Spec-aligned alias: `/api/v1/pm/equipment` */
@Controller(`${API_V1_PREFIX}/pm/equipment`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmEquipmentController {
  constructor(
    private readonly equipment: PmEquipmentSafetyService,
    private readonly cail: PmEquipmentCailIntelligenceService,
  ) {}

  @Post('offline/sync')
  @HttpCode(HttpStatus.OK)
  @Throttle(30, 60)
  offlineSync(
    @Body()
    body: {
      projectId: number;
      inspections?: Array<Record<string, unknown>>;
      lotoCreates?: Array<Record<string, unknown>>;
      failures?: Array<Record<string, unknown>>;
      authorizations?: Array<Record<string, unknown>>;
    },
    @Req() req: { user: { id: number } },
  ) {
    return this.equipment.applyOfflineSync(body.projectId, body, req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SUPERVISOR_ROLES)
  register(
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.equipment.registerEquipment(
      body as Parameters<PmEquipmentSafetyService['registerEquipment']>[0],
      req.user.id,
    );
  }

  @Get(':id/score')
  score(
    @Param('id', ParseIntPipe) id: number,
    @Query('projectId') projectId?: string,
  ) {
    return this.equipment.getEquipmentScore(
      id,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get(':id/predict')
  predict(@Param('id', ParseIntPipe) id: number) {
    return this.cail.equipmentRiskPrediction(id);
  }

  @Post(':id/inspection')
  inspection(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.equipment.recordEquipmentInspection({
      ...(body as object),
      equipmentId: id,
      inspectorUserId: req.user.id,
    } as Parameters<PmEquipmentSafetyService['recordEquipmentInspection']>[0]);
  }

  @Post(':id/certification')
  @Roles(...SUPERVISOR_ROLES)
  certification(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.equipment.createCertification(
      { ...(body as object), equipmentId: id } as Parameters<
        PmEquipmentSafetyService['createCertification']
      >[0],
      req.user.id,
    );
  }

  @Post(':id/authorize')
  @Roles(...SUPERVISOR_ROLES)
  authorize(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.equipment.grantAuthorization(
      { ...(body as object), equipmentId: id } as Parameters<
        PmEquipmentSafetyService['grantAuthorization']
      >[0],
      req.user.id,
    );
  }

  @Post(':id/lockout')
  lockout(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    return this.equipment.createLoto(
      { ...(body as object), equipmentId: id } as Parameters<
        PmEquipmentSafetyService['createLoto']
      >[0],
      req.user.id,
    );
  }

  @Post(':id/unlock')
  @Roles(...SUPERVISOR_ROLES)
  unlock(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: number } },
  ) {
    return this.equipment.unlockEquipment(id, req.user.id);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.equipment.getProfile(id);
  }
}

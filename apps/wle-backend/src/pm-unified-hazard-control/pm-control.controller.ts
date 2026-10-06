import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmUnifiedHazardControlService } from './pm-unified-hazard-control.service';

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

/** Spec-aligned alias: `/api/v1/pm/control` */
@Controller(`${API_V1_PREFIX}/pm/control`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmControlController {
  constructor(private readonly hc: PmUnifiedHazardControlService) {}

  @Post()
  @Roles(...SUPERVISOR_ROLES)
  createControl(
    @Body() body: { companyId: number } & Record<string, unknown>,
    @Req() req: { user: { id: number } },
  ) {
    const { companyId, ...data } = body;
    return this.hc.createControl(
      companyId,
      data as Parameters<PmUnifiedHazardControlService['createControl']>[1],
      req.user.id,
    );
  }

  @Get(':id')
  getControl(@Param('id') id: string) {
    return this.hc.getControl(id);
  }

  @Post(':id/publish')
  @Roles(...SUPERVISOR_ROLES)
  publish(@Param('id') id: string, @Req() req: { user: { id: number } }) {
    return this.hc.publishControl(id, req.user.id);
  }
}

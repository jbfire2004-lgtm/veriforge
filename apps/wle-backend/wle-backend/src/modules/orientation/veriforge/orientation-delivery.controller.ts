import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../../config/routes';
import { SUPERVISOR_ROLES } from '../../vera-core/roles';
import { TenantScopeService } from '../../../security/tenant-scope.service';
import type { SecurityActor } from '../../../security/security.types';
import { OrientationDeliveryService } from './orientation-delivery.service';

@Controller(`${API_V1_PREFIX}/delivery/orientation`)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrientationDeliveryController {
  constructor(
    private readonly delivery: OrientationDeliveryService,
    private readonly tenant: TenantScopeService,
  ) {}

  @Post('assign')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SUPERVISOR_ROLES)
  @Throttle(30, 60)
  assign(
    @Req() req: { user: SecurityActor },
    @Body()
    body: {
      workerId: number;
      orientationId: string;
      companyId?: number;
    },
  ) {
    const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
    return this.delivery.assign({
      workerId: body.workerId,
      orientationId: body.orientationId,
      companyId,
      assignedById: req.user.id,
    });
  }

  @Get('links')
  @Roles(...SUPERVISOR_ROLES, UserRole.WORKER, UserRole.CONTRACTOR_USER)
  links(@Query('workerId') workerIdRaw: string) {
    const workerId = parseInt(workerIdRaw, 10);
    return this.delivery.listLinks(workerId);
  }
}

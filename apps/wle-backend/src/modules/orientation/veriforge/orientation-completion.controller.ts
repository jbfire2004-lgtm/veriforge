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
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { API_V1_PREFIX } from '../../../config/routes';
import { SUPERVISOR_ROLES } from '../../vera-core/roles';
import { TenantScopeService } from '../../../security/tenant-scope.service';
import type { SecurityActor } from '../../../security/security.types';
import { OrientationCompletionService } from './orientation-completion.service';
import type { OrientationCompletionStatus } from './orientation.types';

@Controller(`${API_V1_PREFIX}/orientation-completions`)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrientationCompletionController {
  constructor(
    private readonly completions: OrientationCompletionService,
    private readonly tenant: TenantScopeService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SUPERVISOR_ROLES, UserRole.WORKER, UserRole.CONTRACTOR_USER)
  create(
    @Req() req: { user: SecurityActor },
    @Body()
    body: {
      workerId: number;
      orientationId: string;
      companyId?: number;
      projectId?: number;
      score?: number;
      status?: OrientationCompletionStatus;
      clientSyncId?: string;
    },
  ) {
    const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
    return this.completions.create({
      workerId: body.workerId,
      orientationId: body.orientationId,
      companyId,
      projectId: body.projectId,
      score: body.score,
      status: body.status,
      clientSyncId: body.clientSyncId,
      actorId: req.user.id,
    });
  }

  @Get()
  @Roles(...SUPERVISOR_ROLES, UserRole.WORKER, UserRole.CONTRACTOR_USER)
  list(
    @Query('workerId') workerIdRaw?: string,
    @Query('orientationId') orientationId?: string,
  ) {
    return this.completions.list({
      workerId: workerIdRaw ? parseInt(workerIdRaw, 10) : undefined,
      orientationId,
    });
  }
}

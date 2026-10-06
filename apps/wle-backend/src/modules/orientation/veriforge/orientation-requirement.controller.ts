import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { OrientationRequirementService } from './orientation-requirement.service';
import type { OrientationMustCompleteBefore } from './orientation.types';

@Controller(`${API_V1_PREFIX}/orientation-requirements`)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrientationRequirementController {
  constructor(
    private readonly requirements: OrientationRequirementService,
    private readonly tenant: TenantScopeService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(...SUPERVISOR_ROLES)
  create(
    @Req() req: { user: SecurityActor },
    @Body()
    body: {
      orientationId: string;
      companyId?: number;
      projectId?: number;
      siteId?: number;
      tradeId?: string;
      unionDispatchType?: string;
      mustCompleteBefore: OrientationMustCompleteBefore;
      isActive?: boolean;
    },
  ) {
    const companyId = this.tenant.effectiveCompanyId(req.user, body.companyId);
    return this.requirements.create(
      {
        orientationId: body.orientationId,
        companyId,
        projectId: body.projectId,
        siteId: body.siteId,
        tradeId: body.tradeId,
        unionDispatchType: body.unionDispatchType,
        mustCompleteBefore: body.mustCompleteBefore,
        isActive: body.isActive,
      },
      { id: req.user.id, companyId },
    );
  }

  @Get()
  @Roles(...SUPERVISOR_ROLES, UserRole.WORKER)
  list(
    @Req() req: { user: SecurityActor },
    @Query('companyId') companyIdRaw?: string,
    @Query('projectId') projectIdRaw?: string,
    @Query('workerId') workerIdRaw?: string,
    @Query('isActive') isActiveRaw?: string,
  ) {
    const companyId = this.tenant.effectiveCompanyId(
      req.user,
      companyIdRaw ? parseInt(companyIdRaw, 10) : undefined,
    );
    return this.requirements.list({
      companyId,
      projectId: projectIdRaw ? parseInt(projectIdRaw, 10) : undefined,
      workerId: workerIdRaw ? parseInt(workerIdRaw, 10) : undefined,
      isActive:
        isActiveRaw === 'true'
          ? true
          : isActiveRaw === 'false'
            ? false
            : undefined,
    });
  }

  @Put(':id')
  @Roles(...SUPERVISOR_ROLES)
  update(
    @Param('id') id: string,
    @Req() req: { user: SecurityActor },
    @Body()
    body: {
      projectId?: number | null;
      siteId?: number | null;
      tradeId?: string | null;
      unionDispatchType?: string | null;
      mustCompleteBefore?: OrientationMustCompleteBefore;
      isActive?: boolean;
    },
  ) {
    return this.requirements.update(
      id,
      {
        projectId: body.projectId ?? undefined,
        siteId: body.siteId ?? undefined,
        tradeId: body.tradeId ?? undefined,
        unionDispatchType: body.unionDispatchType ?? undefined,
        mustCompleteBefore: body.mustCompleteBefore,
        isActive: body.isActive,
      },
      { id: req.user.id, companyId: req.user.companyId ?? undefined },
    );
  }
}

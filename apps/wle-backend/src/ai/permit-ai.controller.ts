import {
  Body,
  Controller,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { TenantScoped } from '../security/decorators/tenant-scoped.decorator';
import { TenantScopeService } from '../security/tenant-scope.service';
import { Permission } from '../security/security.types';
import type { SecurityActor } from '../security/security.types';
import { PermitAiService } from './permit-ai.service';
import { PermitToWorkAiService } from './permit-to-work-ai.service';
import type { PermitToWorkAiInput } from './permit-to-work-ai.types';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/** AI-powered smart permit generation for Vera PM. */
@Controller('api/ai/permit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class PermitAiController {
  constructor(
    private readonly permitAi: PermitAiService,
    private readonly permitToWork: PermitToWorkAiService,
    private readonly tenant: TenantScopeService,
  ) {}

  @Post('suggest')
  @HttpCode(200)
  @TenantScoped()
  suggest(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId: string,
    @Query('projectId') projectId: string,
    @Body()
    body: {
      permitType: string;
      jobScope: string;
      workerId?: number;
      equipmentIds?: number[];
      locationNote?: string;
      weatherNote?: string;
    },
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      companyId ? parseInt(companyId, 10) : undefined,
    );
    return this.permitAi.suggest({
      companyId: effectiveCompanyId,
      projectId: parseInt(projectId, 10),
      permitType: body.permitType,
      jobScope: body.jobScope,
      workerId: body.workerId,
      equipmentIds: body.equipmentIds,
      locationNote: body.locationNote,
      weatherNote: body.weatherNote,
    });
  }

  @Post('evaluate')
  @HttpCode(200)
  @TenantScoped()
  evaluate(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId: string,
    @Query('projectId') projectId: string,
    @Body() body: PermitToWorkAiInput,
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      companyId ? parseInt(companyId, 10) : body.companyId,
    );
    return this.permitToWork.evaluate({
      ...body,
      companyId: effectiveCompanyId,
      projectId: body.projectId ?? parseInt(projectId, 10),
    });
  }
}

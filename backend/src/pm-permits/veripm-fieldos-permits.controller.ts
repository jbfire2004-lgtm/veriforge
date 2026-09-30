import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  UserRole,
  VeripmPermitRiskLevel,
  VeripmPermitSyncStatus,
} from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { TenantScoped } from '../security/decorators/tenant-scoped.decorator';
import { PublicRateLimited } from '../security/decorators/public-rate-limit.decorator';
import { Permission } from '../security/security.types';
import type { SecurityActor } from '../security/security.types';
import {
  VeripmFieldosPermitsService,
  type CreateVeripmPermitInput,
  type FieldOsWebhookPayload,
} from './veripm-fieldos-permits.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/**
 * VERIPM ↔ FieldOS permit integration.
 * Proxied via Next rewrite prefix `api/v1/pm`.
 */
@Controller(`${API_V1_PREFIX}/pm/fieldos-permits`)
export class VeripmFieldosPermitsController {
  constructor(private readonly service: VeripmFieldosPermitsService) {}

  @Get('metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @RequirePermission(Permission.PM_ACCESS)
  @TenantScoped()
  metrics(
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.service.metrics(
      companyId ? parseInt(companyId, 10) : undefined,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('revision')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @RequirePermission(Permission.PM_ACCESS)
  revision() {
    return this.service.getDashboardRevision();
  }

  @Get('tasks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @RequirePermission(Permission.PM_ACCESS)
  @TenantScoped()
  listTasks(
    @Query('projectId') projectId?: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.service.listFieldOsTasks(
      projectId ? parseInt(projectId, 10) : undefined,
      companyId ? parseInt(companyId, 10) : undefined,
    );
  }

  /** FieldOS → VERIPM webhook (HMAC optional via FIELDOS_WEBHOOK_SECRET). */
  @Post('webhook')
  @PublicRateLimited(120, 60_000)
  webhook(
    @Body() body: FieldOsWebhookPayload,
    @Headers('x-vera-signature') signature?: string,
  ) {
    return this.service.handleWebhook(body, signature);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @RequirePermission(Permission.PM_ACCESS)
  @TenantScoped()
  list(
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
    @Query('contractorId') contractorId?: string,
    @Query('status') status?: VeripmPermitSyncStatus,
  ) {
    return this.service.list({
      companyId: companyId ? parseInt(companyId, 10) : undefined,
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      contractorId: contractorId ? parseInt(contractorId, 10) : undefined,
      status,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @RequirePermission(Permission.PM_ACCESS)
  @TenantScoped()
  create(
    @Req() req: { user?: SecurityActor },
    @Body() body: CreateVeripmPermitInput & { title?: string },
  ) {
    return this.service.create({
      ...body,
      createdByUserId: body.createdByUserId ?? req.user?.userId,
      riskLevel: body.riskLevel as VeripmPermitRiskLevel | undefined,
    });
  }

  @Get(':permitId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @RequirePermission(Permission.PM_ACCESS)
  get(@Param('permitId') permitId: string) {
    return this.service.get(permitId);
  }

  @Get(':permitId/drill')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @RequirePermission(Permission.PM_ACCESS)
  async drill(@Param('permitId') permitId: string) {
    const detail = await this.service.get(permitId);
    return {
      metricId: 'pm.permits.drill',
      permit: detail,
      activities: detail.activities,
      fieldosTask: detail.fieldosTask,
      formula: detail.drill,
      links: {
        veripm: detail.pm_permit_id
          ? `/pm/permits/${detail.pm_permit_id}`
          : `/pm/permits`,
        fieldos: `/field/permits`,
        dashboard: `/pm/dashboard?projectId=${detail.project_id}`,
      },
    };
  }

  @Post(':permitId/push')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...PM_ROLES)
  @RequirePermission(Permission.PM_ACCESS)
  push(@Param('permitId') permitId: string, @Body() body?: { title?: string }) {
    return this.service.pushToFieldOs(permitId, body?.title);
  }
}

import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PmInspectionTemplateStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { TenantScoped } from '../security/decorators/tenant-scoped.decorator';
import { TenantScopeService } from '../security/tenant-scope.service';
import { Permission } from '../security/security.types';
import type { SecurityActor } from '../security/security.types';
import { InspectionCatalogService } from './inspection-catalog.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/**
 * Unified inspection catalog for Vera PM — templates, checklists, and smart inspection metadata.
 * Mounted at `/api/v1/inspections/*` alongside Vera Core inspection routes.
 */
@Controller(`${API_V1_PREFIX}/inspections`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class InspectionCatalogController {
  constructor(
    private readonly catalog: InspectionCatalogService,
    private readonly tenant: TenantScopeService,
  ) {}

  @Get('templates')
  @TenantScoped()
  listTemplates(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('kind') kind?: string,
    @Query('status') status?: PmInspectionTemplateStatus,
    @Query('autoSeed') autoSeed?: string,
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      companyId ? parseInt(companyId, 10) : undefined,
    );
    return this.catalog.listPmTemplates(
      effectiveCompanyId,
      projectId ? parseInt(projectId, 10) : undefined,
      {
        kind,
        status,
        autoSeed: autoSeed !== 'false',
      },
    );
  }

  @Get('smart')
  @TenantScoped()
  getSmart(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      companyId ? parseInt(companyId, 10) : undefined,
    );
    return this.catalog.getSmartCatalog(
      effectiveCompanyId,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  /** PM checklist library (published templates + optional Vera Core equipment checklists). */
  @Get('checklists/pm')
  @TenantScoped()
  listPmChecklists(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      companyId ? parseInt(companyId, 10) : undefined,
    );
    return this.catalog.listUnifiedChecklists(
      effectiveCompanyId,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }
}

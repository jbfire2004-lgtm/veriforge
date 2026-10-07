import {
  Body,
  Controller,
  Get,
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
import { API_V1_PREFIX } from '../config/routes';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { TenantScoped } from '../security/decorators/tenant-scoped.decorator';
import { TenantScopeService } from '../security/tenant-scope.service';
import { Permission } from '../security/security.types';
import type { SecurityActor } from '../security/security.types';
import { HazardControlCatalogService } from './hazard-control-catalog.service';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
];

/**
 * Vera Core hazard library for PM JHA/FLHA — seeded master catalog with search and suggestions.
 */
@Controller(`${API_V1_PREFIX}/hazards`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class HazardCatalogController {
  constructor(
    private readonly catalog: HazardControlCatalogService,
    private readonly tenant: TenantScopeService,
  ) {}

  @Get()
  @TenantScoped()
  listHazards(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('taskCode') taskCode?: string,
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      companyId ? parseInt(companyId, 10) : undefined,
    );
    return this.catalog.listHazards(
      effectiveCompanyId,
      projectId ? parseInt(projectId, 10) : undefined,
      { category, search, taskCode },
    );
  }

  @Get('suggest')
  @TenantScoped()
  suggestForTask(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('taskDescription') taskDescription?: string,
    @Query('locationNote') locationNote?: string,
    @Query('weather') weather?: string,
    @Query('existingHazards') existingHazards?: string,
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      companyId ? parseInt(companyId, 10) : undefined,
    );
    return this.catalog.suggestHazardsForTask(
      effectiveCompanyId,
      projectId ? parseInt(projectId, 10) : undefined,
      {
        taskDescription: taskDescription ?? '',
        locationNote,
        weather,
        existingHazardDescriptions: existingHazards?.split('|').filter(Boolean),
      },
    );
  }

  @Post('ai-identify')
  @HttpCode(200)
  @TenantScoped()
  aiIdentify(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId: string,
    @Body()
    body: {
      taskDescription: string;
      workScope?: string;
      locationNote?: string;
      equipment?: string[];
    },
    @Query('projectId') projectId?: string,
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      companyId ? parseInt(companyId, 10) : undefined,
    );
    return this.catalog.aiIdentifyHazards(
      effectiveCompanyId,
      projectId ? parseInt(projectId, 10) : undefined,
      body,
    );
  }
}

/** Vera Core control library for PM JHA/FLHA. */
@Controller(`${API_V1_PREFIX}/controls`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class ControlCatalogController {
  constructor(
    private readonly catalog: HazardControlCatalogService,
    private readonly tenant: TenantScopeService,
  ) {}

  @Get()
  @TenantScoped()
  listControls(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('hazardCategory') hazardCategory?: string,
    @Query('hazardCategories') hazardCategories?: string,
    @Query('search') search?: string,
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      companyId ? parseInt(companyId, 10) : undefined,
    );
    return this.catalog.listControls(
      effectiveCompanyId,
      projectId ? parseInt(projectId, 10) : undefined,
      {
        hazardCategory,
        hazardCategories: hazardCategories?.split(',').filter(Boolean),
        search,
      },
    );
  }

  @Get('suggest')
  @TenantScoped()
  suggestForHazards(
    @Req() req: { user?: SecurityActor },
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('taskDescription') taskDescription?: string,
    @Query('hazardCategories') hazardCategories?: string,
    @Query('hazardDescriptions') hazardDescriptions?: string,
    @Query('energyTypes') energyTypes?: string,
    @Query('focusedHazardCategory') focusedHazardCategory?: string,
    @Query('focusedHazardDescription') focusedHazardDescription?: string,
    @Query('focusedHazardEnergyTypes') focusedHazardEnergyTypes?: string,
    @Query('existingControls') existingControls?: string,
  ) {
    const actor = req.user!;
    const effectiveCompanyId = this.tenant.effectiveCompanyId(
      actor,
      companyId ? parseInt(companyId, 10) : undefined,
    );
    return this.catalog.suggestControlsForHazards(
      effectiveCompanyId,
      projectId ? parseInt(projectId, 10) : undefined,
      {
        taskDescription,
        hazardCategories: hazardCategories?.split(',').filter(Boolean),
        hazardDescriptions: hazardDescriptions?.split('|').filter(Boolean),
        energyTypes: energyTypes?.split(',').filter(Boolean),
        focusedHazardCategory,
        focusedHazardDescription,
        focusedHazardEnergyTypes: focusedHazardEnergyTypes
          ?.split(',')
          .filter(Boolean),
        existingControlDescriptions: existingControls
          ?.split('|')
          .filter(Boolean),
      },
    );
  }
}

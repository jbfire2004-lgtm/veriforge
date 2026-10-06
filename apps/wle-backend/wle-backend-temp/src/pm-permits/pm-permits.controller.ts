import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PmPermitType, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { TenantScoped } from '../security/decorators/tenant-scoped.decorator';
import { TenantScopeService } from '../security/tenant-scope.service';
import { Permission } from '../security/security.types';
import type { SecurityActor } from '../security/security.types';
import {
  PmPermitsService,
  type PermitWorkflowJson,
} from './pm-permits.service';

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

/** Unified PM permits API — catalog, lifecycle, and workflow payload. */
@Controller(`${API_V1_PREFIX}/permits`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
@RequirePermission(Permission.PM_ACCESS)
export class PmPermitsController {
  constructor(
    private readonly permits: PmPermitsService,
    private readonly tenant: TenantScopeService,
  ) {}

  @Get('types')
  listTypes() {
    return this.permits.listTypes();
  }

  @Get('active')
  @TenantScoped()
  listActive(
    @Req() req: { user?: SecurityActor },
    @Query('projectId') projectId: string,
    @Query('companyId') companyId?: string,
  ) {
    void req.user;
    void companyId;
    return this.permits.listActive(parseInt(projectId, 10));
  }

  @Get('history')
  @TenantScoped()
  listHistory(
    @Req() req: { user?: SecurityActor },
    @Query('projectId') projectId: string,
    @Query('companyId') companyId?: string,
  ) {
    void req.user;
    void companyId;
    return this.permits.listHistory(parseInt(projectId, 10));
  }

  @Get()
  @TenantScoped()
  list(
    @Req() req: { user?: SecurityActor },
    @Query('projectId') projectId: string,
    @Query('companyId') companyId?: string,
    @Query('tab') tab?: string,
  ) {
    void req.user;
    void companyId;
    const pid = parseInt(projectId, 10);
    if (tab === 'pending') return this.permits.listPending(pid);
    if (tab === 'expired') return this.permits.listExpired(pid);
    if (tab === 'active') return this.permits.listActive(pid);
    if (tab === 'history') return this.permits.listHistory(pid);
    return this.permits.listPermits(pid);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.permits.getPermit(id);
  }

  @Post()
  @TenantScoped()
  create(
    @Req() req: { user?: SecurityActor },
    @Query('projectId') projectId: string,
    @Body()
    body: {
      permitType: PmPermitType;
      title: string;
      workPackageId?: string;
      taskId?: string;
      requiredTraining?: string[];
      requiredControls?: string[];
      requiredJhaId?: string;
      validFrom?: string;
      validTo?: string;
      workflow?: PermitWorkflowJson;
    },
  ) {
    return this.permits.createPermit(
      parseInt(projectId, 10),
      body,
      req.user?.userId,
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      validFrom?: string;
      validTo?: string;
      requiredTraining?: string[];
      requiredControls?: string[];
      workflow?: PermitWorkflowJson;
    },
  ) {
    return this.permits.updatePermit(id, body);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Req() req: { user?: SecurityActor }) {
    return this.permits.submitPermit(id, req.user?.userId);
  }

  @Post(':id/approve')
  @Roles(...SUPERVISOR_ROLES)
  approve(@Param('id') id: string, @Req() req: { user?: SecurityActor }) {
    return this.permits.approvePermit(id, req.user?.userId ?? 0);
  }

  @Post(':id/activate')
  @Roles(...SUPERVISOR_ROLES)
  activate(@Param('id') id: string, @Req() req: { user?: SecurityActor }) {
    return this.permits.activatePermit(id, req.user?.userId);
  }

  @Post(':id/close')
  @Roles(...SUPERVISOR_ROLES)
  close(@Param('id') id: string, @Req() req: { user?: SecurityActor }) {
    return this.permits.closePermit(id, req.user?.userId);
  }
}

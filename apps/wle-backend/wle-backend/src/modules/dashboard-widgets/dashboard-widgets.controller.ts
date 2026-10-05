import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import {
  STAFF_ROLES,
  TRAINING_INSTRUCTOR_ROLES,
  TRAINING_PROVIDER_ADMIN_ROLES,
  UNION_HALL_ROLES,
} from '../vera-core/roles';
import { DashboardWidgetsService } from './dashboard-widgets.service';
import { DashboardWidgetsQueryDto } from './dto/dashboard-widgets-query.dto';
import type { DashboardWidgetScope } from './dashboard-widgets.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller(`${API_V1_PREFIX}/dashboard`)
export class DashboardWidgetsController {
  constructor(private readonly widgets: DashboardWidgetsService) {}

  @Get('widgets')
  @Roles(
    ...STAFF_ROLES,
    ...UNION_HALL_ROLES,
    ...TRAINING_PROVIDER_ADMIN_ROLES,
    ...TRAINING_INSTRUCTOR_ROLES,
  )
  widgetsBundle(
    @Query() query: DashboardWidgetsQueryDto,
    @Req() req: { user?: { role?: string } },
  ) {
    const role = req.user?.role ?? '';
    const scope = resolveWidgetScope(role, query.companyId, query.unionHallId);
    return this.widgets.getBundle(scope);
  }
}

/** Maps JWT role to which widget pipelines to run (mirrors frontend role-access). */
export function resolveWidgetScope(
  role: string,
  companyId?: number,
  unionHallId?: number,
): DashboardWidgetScope {
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isCompanyAdmin = role === 'COMPANY_ADMIN' || isSuperAdmin;
  const isSupervisor =
    role === 'SUPERVISOR' || role === 'PROJECT_MANAGER' || isCompanyAdmin;
  const isUnionHall = role === 'UNION_HALL_ADMIN' || isSuperAdmin;
  const isProviderAdmin = role === 'TRAINING_PROVIDER_ADMIN' || isSuperAdmin;
  const isInstructor = role === 'TRAINING_INSTRUCTOR';

  if (isInstructor && !isProviderAdmin) {
    return {
      companyId,
      includeTrainingExpiry: true,
      includeProviderApprovals: true,
    };
  }

  if (isProviderAdmin && !isSuperAdmin) {
    return {
      companyId,
      includeTrainingExpiry: true,
      includeProviderApprovals: true,
    };
  }

  if (isUnionHall && !isSuperAdmin) {
    return {
      companyId,
      unionHallId,
      includeWorkerCompliance: true,
      includeTrainingExpiry: true,
      includeUnionDispatch: true,
    };
  }

  if (isSupervisor && !isCompanyAdmin) {
    return {
      companyId,
      includeWorkerCompliance: true,
      includeEquipmentCompliance: true,
      includeProjectReadiness: true,
      includeAssignments: true,
    };
  }

  if (isCompanyAdmin && !isSuperAdmin) {
    return {
      companyId,
      includeWorkerCompliance: true,
      includeEquipmentCompliance: true,
      includeProjectReadiness: true,
      includeTrainingExpiry: true,
    };
  }

  // Super admin — full operational dashboard
  return {
    companyId,
    unionHallId,
    includeWorkerCompliance: true,
    includeEquipmentCompliance: true,
    includeTrainingExpiry: true,
    includeProjectReadiness: true,
    includeProviderApprovals: true,
    includeUnionDispatch: true,
    includeSystemHealth: true,
    includeAssignments: true,
  };
}

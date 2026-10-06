import { mapJwtRoleToHubRole } from './hub-role.utils';
import { resolveWidgetScope } from '../dashboard-widgets/dashboard-widgets.controller';
import type { HubWidgetVisibility } from './hub-widgets.types';

export function resolveHubWidgetVisibility(role: string): HubWidgetVisibility {
  const hubRole = mapJwtRoleToHubRole(role);

  if (hubRole === 'WORKER') {
    return {
      workerReadiness: false,
      equipmentReadiness: false,
      trainingExpiring: true,
      safetyAlerts: true,
      projectActivity: false,
    };
  }

  if (hubRole === 'UNION_HALL') {
    return {
      workerReadiness: true,
      equipmentReadiness: false,
      trainingExpiring: true,
      safetyAlerts: false,
      projectActivity: false,
    };
  }

  if (hubRole === 'SUPERVISOR') {
    return {
      workerReadiness: true,
      equipmentReadiness: true,
      trainingExpiring: true,
      safetyAlerts: true,
      projectActivity: true,
    };
  }

  return {
    workerReadiness: true,
    equipmentReadiness: true,
    trainingExpiring: true,
    safetyAlerts: true,
    projectActivity: true,
  };
}

export function hubWidgetScopeForUser(
  role: string,
  companyId?: number,
  unionHallId?: number,
) {
  return resolveWidgetScope(role, companyId, unionHallId);
}

export function workerReadinessHref(role: string): string {
  const hubRole = mapJwtRoleToHubRole(role);
  if (hubRole === 'WORKER') return '/training';
  if (hubRole === 'UNION_HALL') return '/union-hall';
  if (hubRole === 'SUPERVISOR') return '/supervisor/worker-lookup';
  return '/admin/workers';
}

export function equipmentReadinessHref(role: string): string {
  const hubRole = mapJwtRoleToHubRole(role);
  if (hubRole === 'SUPERVISOR') return '/equipment';
  return '/admin/equipment';
}

export function trainingExpiringHref(role: string): string {
  const hubRole = mapJwtRoleToHubRole(role);
  if (hubRole === 'WORKER') return '/training';
  if (hubRole === 'UNION_HALL') return '/union-hall/training';
  if (hubRole === 'SUPERVISOR') return '/supervisor/training';
  return '/admin/training';
}

export function safetyAlertsHref(role: string): string {
  const hubRole = mapJwtRoleToHubRole(role);
  if (hubRole === 'WORKER') return '/safety';
  return '/pm/incidents';
}

export function projectActivityHref(role: string): string {
  const hubRole = mapJwtRoleToHubRole(role);
  if (hubRole === 'SUPERVISOR') return '/core/daily-logs';
  return '/pm';
}

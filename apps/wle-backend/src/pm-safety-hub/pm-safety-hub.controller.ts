import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PmSafetyHubDomain, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { PmSafetyHubDashboardService } from './pm-safety-hub-dashboard.service';
import { PmSafetyHubEvidenceService } from './pm-safety-hub-evidence.service';
import { PmSafetyHubAnalyticsService } from './pm-safety-hub-analytics.service';
import { PmSafetyHubNotificationsService } from './pm-safety-hub-notifications.service';
import { PmUnifiedCorrectiveActionService } from '../pm-unified-corrective-action/pm-unified-corrective-action.service';
import { RequireModule } from '../acp/decorators/vera-access.decorator';
import { VeraModuleGuard } from '../acp/guards/vera-module.guard';
import {
  SAFETY_HUB_DOMAIN_LABELS,
  SAFETY_HUB_MODULE_LINKS,
} from './safety-hub.constants';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.CONTRACTOR_ADMIN,
];

@Controller(`${API_V1_PREFIX}/pm/safety-hub`)
@UseGuards(JwtAuthGuard, RolesGuard, VeraModuleGuard)
@Roles(...PM_ROLES)
@RequireModule('pm.safety-hub')
export class PmSafetyHubController {
  constructor(
    private readonly dashboard: PmSafetyHubDashboardService,
    private readonly evidence: PmSafetyHubEvidenceService,
    private readonly analytics: PmSafetyHubAnalyticsService,
    private readonly hubNotifications: PmSafetyHubNotificationsService,
    private readonly unifiedCapa: PmUnifiedCorrectiveActionService,
  ) {}

  @Get('meta')
  meta() {
    return {
      domains: Object.entries(SAFETY_HUB_DOMAIN_LABELS).map(([id, label]) => ({
        id,
        label,
        link: SAFETY_HUB_MODULE_LINKS[
          id as keyof typeof SAFETY_HUB_MODULE_LINKS
        ],
      })),
      pillars: [
        { id: 'dashboard', label: 'One dashboard' },
        { id: 'notifications', label: 'One notification system' },
        { id: 'evidence', label: 'One evidence library' },
        { id: 'capa', label: 'One corrective action engine' },
        { id: 'analytics', label: 'One analytics layer' },
      ],
    };
  }

  @Get('dashboard')
  getDashboard(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('refresh') refresh?: string,
  ) {
    const filters = {
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    };
    if (refresh === 'true') {
      return this.dashboard.buildSnapshot(filters);
    }
    return this.dashboard.getCachedOrBuild(filters);
  }

  @Post('dashboard/refresh')
  refreshDashboard(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.dashboard.buildSnapshot({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('evidence')
  searchEvidence(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('domain') domain?: PmSafetyHubDomain,
    @Query('q') q?: string,
  ) {
    return this.evidence.search({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      domain,
      q,
    });
  }

  @Post('evidence/reindex')
  @Roles(
    UserRole.COMPANY_ADMIN,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
  )
  reindexEvidence(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.evidence.reindexCompany(
      parseInt(companyId, 10),
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('notifications')
  listNotifications(
    @Req() req: { user: { id: number } },
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.hubNotifications.listSafetyNotifications(req.user.id, {
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Get('notifications/unread-count')
  unreadCount(@Req() req: { user: { id: number } }) {
    return this.hubNotifications.unreadCount(req.user.id);
  }

  @Get('analytics')
  getAnalytics(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.analytics.getUnifiedAnalytics({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('capa')
  getCapaDashboard(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.unifiedCapa.getDashboard({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
    });
  }

  @Get('timeline')
  getTimeline(
    @Query('companyId') companyId: string,
    @Query('projectId') projectId?: string,
    @Query('take') take?: string,
  ) {
    return this.dashboard.getTimeline({
      companyId: parseInt(companyId, 10),
      projectId: projectId ? parseInt(projectId, 10) : undefined,
      take: take ? parseInt(take, 10) : 50,
    });
  }
}

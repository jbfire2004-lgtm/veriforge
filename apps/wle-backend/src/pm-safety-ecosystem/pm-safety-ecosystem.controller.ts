import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { API_V1_PREFIX } from '../config/routes';
import { SAFETY_HUB_MODULE_LINKS } from '../pm-safety-hub/safety-hub.constants';

const PM_ROLES: UserRole[] = [
  UserRole.WORKER,
  UserRole.SUPERVISOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.CONTRACTOR_ADMIN,
];

@Controller(`${API_V1_PREFIX}/pm/safety-ecosystem`)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...PM_ROLES)
export class PmSafetyEcosystemController {
  @Get('status')
  status() {
    return {
      version: '1.0.0',
      integration: 'unified',
      eventBus: 'in-process',
      pillars: [
        'dashboard',
        'notifications',
        'evidence',
        'corrective_actions',
        'analytics',
      ],
      modules: [
        {
          id: 'inspections',
          api: '/api/v1/pm/inspections',
          ui: '/pm/inspections',
          capabilities: [
            'photo_pipeline',
            'auto_findings',
            'auto_capa',
            'contractor_dispatch',
          ],
        },
        {
          id: 'investigations',
          api: '/api/v1/pm/incidents',
          ui: '/pm/incidents',
          capabilities: [
            'taproot_rca',
            'guided_flow',
            'capa_bridge',
            'pdf_report',
          ],
        },
        {
          id: 'substance_testing',
          api: '/api/v1/pm/substance-testing',
          ui: '/pm/substance-testing',
          capabilities: ['custody', 'results', 'compliance', 'incident_link'],
        },
        {
          id: 'predictive_analytics',
          api: '/api/v1/pm/predictive-safety-analytics',
          ui: '/pm/predictive-safety-analytics',
          capabilities: ['weekly_forecast', 'risk_scoring', 'alerts'],
        },
        {
          id: 'contractor_portal',
          api: '/api/v1/pm/contractor-portal',
          ui: '/contractor',
          capabilities: ['inbox', 'findings', 'compliance', 'messaging'],
        },
        {
          id: 'safety_hub',
          api: '/api/v1/pm/safety-hub',
          ui: '/pm/safety-hub',
          capabilities: ['aggregate_dashboard', 'evidence_library', 'timeline'],
        },
        {
          id: 'unified_capa',
          api: '/api/v1/pm/unified-corrective-action',
          ui: '/pm/unified-corrective-action',
          capabilities: ['cross_module_generation', 'publish', 'verification'],
        },
        {
          id: 'unified_intelligence',
          api: '/api/v1/pm/unified-safety-intelligence',
          ui: '/pm/unified-safety-intelligence',
          capabilities: ['cail_scores', 'recommendations', 'explainability'],
        },
      ],
      domainLinks: SAFETY_HUB_MODULE_LINKS,
      offlineSyncTypes: [
        'pmInspections.sync',
        'pmInspectionPhoto.capture',
        'pmIncidents.sync',
        'pmCapa.sync',
        'pmUnifiedCorrectiveAction.sync',
        'pmUnifiedSafetyIntelligence.sync',
      ],
    };
  }
}

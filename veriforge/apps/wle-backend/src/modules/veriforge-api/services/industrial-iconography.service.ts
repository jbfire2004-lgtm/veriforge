import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type IconCategory =
  | 'training'
  | 'verification'
  | 'compliance'
  | 'incidents'
  | 'equipment'
  | 'fieldOps'
  | 'risk'
  | 'audit'
  | 'culture'
  | 'emergency'
  | 'contractor';

export type IconTone = 'neutral' | 'active' | 'critical' | 'contrast';

export type IconSpec = {
  id: string;
  name: string;
  category: IconCategory;
  description: string;
  component: string;
  usage: string;
  timestamp: string;
  userId: number;
};

export type IconViewEvent = {
  id: string;
  iconId: string;
  category: IconCategory;
  tone: IconTone;
  timestamp: string;
  userId: number;
};

export type IconographyAnalytics = {
  totalIcons: number;
  categoryCounts: Record<IconCategory, number>;
  viewCount: number;
  criticalSelections: number;
  iconCoverageScore: number;
  timestamp: string;
  userId: number | null;
};

const CATEGORIES: IconCategory[] = [
  'training',
  'verification',
  'compliance',
  'incidents',
  'equipment',
  'fieldOps',
  'risk',
  'audit',
  'culture',
  'emergency',
  'contractor',
];

@Injectable()
export class IndustrialIconographyService {
  private viewSeq = 1;
  private icons: IconSpec[] = [];
  private views: IconViewEvent[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    const userId = 1;
    const rows: Omit<IconSpec, 'timestamp' | 'userId'>[] = [
      {
        id: 'ico-train-module',
        name: 'Training Module',
        category: 'training',
        description: 'Angular module plate for course units',
        component: 'IconTrainingModule',
        usage: 'Training lists and module cards',
      },
      {
        id: 'ico-train-progress',
        name: 'Training Progress',
        category: 'training',
        description: 'Beveled bar rise for completion',
        component: 'IconTrainingProgress',
        usage: 'Progress rails and dashboards',
      },
      {
        id: 'ico-train-cert',
        name: 'Certification',
        category: 'training',
        description: 'Shield-check for forged credentials',
        component: 'IconTrainingCertification',
        usage: 'Certificates and pass states',
      },
      {
        id: 'ico-ver-check',
        name: 'forgeCheck',
        category: 'verification',
        description: 'Angular check plate for verification',
        component: 'IconForgeCheck',
        usage: 'forgeCheck actions and results',
      },
      {
        id: 'ico-ver-status',
        name: 'forgeStatus',
        category: 'verification',
        description: 'Hex status glyph for forgeStatus',
        component: 'IconForgeStatus',
        usage: 'Status chips and workflow nodes',
      },
      {
        id: 'ico-ver-flow',
        name: 'Workflow',
        category: 'verification',
        description: 'Node connector for forgeFlow',
        component: 'IconWorkflow',
        usage: 'Workflow builder and rails',
      },
      {
        id: 'ico-comp-doc',
        name: 'Document',
        category: 'compliance',
        description: 'Beveled document for compliance files',
        component: 'IconComplianceDocument',
        usage: 'Document libraries',
      },
      {
        id: 'ico-comp-expiry',
        name: 'Expiry',
        category: 'compliance',
        description: 'Hex clock for expiry windows',
        component: 'IconComplianceExpiry',
        usage: 'Expiry alerts and timelines',
      },
      {
        id: 'ico-comp-req',
        name: 'Requirement',
        category: 'compliance',
        description: 'Checklist plate for requirements',
        component: 'IconComplianceRequirement',
        usage: 'Requirement matrices',
      },
      {
        id: 'ico-inc-sev',
        name: 'Severity',
        category: 'incidents',
        description: 'Warning triangle for severity',
        component: 'IconIncidentSeverity',
        usage: 'Critical incident markers',
      },
      {
        id: 'ico-inc-inv',
        name: 'Investigation',
        category: 'incidents',
        description: 'Angular magnifier for investigations',
        component: 'IconIncidentInvestigation',
        usage: 'Investigation queues',
      },
      {
        id: 'ico-inc-ca',
        name: 'Corrective Action',
        category: 'incidents',
        description: 'Forge tool for corrective actions',
        component: 'IconCorrectiveAction',
        usage: 'CAPA tracking',
      },
      {
        id: 'ico-eq-insp',
        name: 'Inspection',
        category: 'equipment',
        description: 'Inspection plate for equipment checks',
        component: 'IconEquipmentInspection',
        usage: 'Inspection schedules',
      },
      {
        id: 'ico-eq-def',
        name: 'Defect',
        category: 'equipment',
        description: 'Crossed plate for defects',
        component: 'IconEquipmentDefect',
        usage: 'Defect logs',
      },
      {
        id: 'ico-eq-cert',
        name: 'Equipment Cert',
        category: 'equipment',
        description: 'Tag cert for equipment clearance',
        component: 'IconEquipmentCertification',
        usage: 'Equipment certification',
      },
      {
        id: 'ico-field-task',
        name: 'Field Task',
        category: 'fieldOps',
        description: 'Checklist for field tasks',
        component: 'IconFieldTask',
        usage: 'Field task boards',
      },
      {
        id: 'ico-field-haz',
        name: 'Field Hazard',
        category: 'fieldOps',
        description: 'Hazard triangle for field risks',
        component: 'IconFieldHazard',
        usage: 'Hazard reports',
      },
      {
        id: 'ico-field-gps',
        name: 'GPS',
        category: 'fieldOps',
        description: 'Angular pin for GPS location',
        component: 'IconFieldGps',
        usage: 'Location and geofence',
      },
      {
        id: 'ico-field-checkin',
        name: 'Check-in',
        category: 'fieldOps',
        description: 'Pulse plate for check-ins',
        component: 'IconFieldCheckIn',
        usage: 'Muster and check-in',
      },
      {
        id: 'ico-risk-haz',
        name: 'Risk Hazard',
        category: 'risk',
        description: 'Diamond hazard for risk matrix',
        component: 'IconRiskHazard',
        usage: 'Risk registers',
      },
      {
        id: 'ico-risk-ctrl',
        name: 'Risk Control',
        category: 'risk',
        description: 'Shield cross for controls',
        component: 'IconRiskControl',
        usage: 'Control libraries',
      },
      {
        id: 'ico-risk-score',
        name: 'Risk Scoring',
        category: 'risk',
        description: 'Bar stack for risk scores',
        component: 'IconRiskScoring',
        usage: 'Scoring dashboards',
      },
      {
        id: 'ico-audit-log',
        name: 'Audit Log',
        category: 'audit',
        description: 'Log plate for audit trails',
        component: 'IconAuditLog',
        usage: 'Audit logs',
      },
      {
        id: 'ico-audit-ev',
        name: 'Evidence',
        category: 'audit',
        description: 'Evidence frame for proof packs',
        component: 'IconAuditEvidence',
        usage: 'Evidence lockers',
      },
      {
        id: 'ico-audit-score',
        name: 'Audit Scoring',
        category: 'audit',
        description: 'Angular chart for audit scores',
        component: 'IconAuditScoring',
        usage: 'Audit scorecards',
      },
      {
        id: 'ico-cult-beh',
        name: 'Behavior',
        category: 'culture',
        description: 'Figure plate for safe behaviors',
        component: 'IconCultureBehavior',
        usage: 'Behavior observations',
      },
      {
        id: 'ico-cult-eng',
        name: 'Engagement',
        category: 'culture',
        description: 'Pin figure for engagement',
        component: 'IconCultureEngagement',
        usage: 'Engagement metrics',
      },
      {
        id: 'ico-cult-camp',
        name: 'Campaign',
        category: 'culture',
        description: 'Banner plate for campaigns',
        component: 'IconCultureCampaign',
        usage: 'Culture campaigns',
      },
      {
        id: 'ico-em-alert',
        name: 'Emergency Alert',
        category: 'emergency',
        description: 'Critical triangle for alerts',
        component: 'IconEmergencyAlert',
        usage: 'Emergency alerts',
      },
      {
        id: 'ico-em-evac',
        name: 'Evacuation',
        category: 'emergency',
        description: 'Exit arrow for evacuation',
        component: 'IconEmergencyEvacuation',
        usage: 'Evacuation routes',
      },
      {
        id: 'ico-em-muster',
        name: 'Muster',
        category: 'emergency',
        description: 'Hex cross for muster points',
        component: 'IconEmergencyMuster',
        usage: 'Muster tracking',
      },
      {
        id: 'ico-ctr-badge',
        name: 'Contractor Badge',
        category: 'contractor',
        description: 'Badge tag for contractor ID',
        component: 'IconContractorBadge',
        usage: 'Badge issuance',
      },
      {
        id: 'ico-ctr-onboard',
        name: 'Onboarding',
        category: 'contractor',
        description: 'Checklist for contractor onboarding',
        component: 'IconContractorOnboarding',
        usage: 'Onboarding pipelines',
      },
      {
        id: 'ico-ctr-access',
        name: 'Access',
        category: 'contractor',
        description: 'Lock plate for site access',
        component: 'IconContractorAccess',
        usage: 'Access control',
      },
    ];
    this.icons = rows.map((r) => ({ ...r, timestamp: now, userId }));
  }

  overview() {
    return {
      principles: [
        'Angular geometry',
        'Metallic gradients',
        'Red accent lines',
        'Black base',
        'Steel-grey outlines',
        'Bold geometric silhouette',
      ],
      rules: {
        red: 'active, critical, or selected',
        steelGrey: 'neutral',
        white: 'high contrast on black',
        monochrome: true,
        scale: '16px–128px',
      },
      categories: CATEGORIES,
      icons: this.icons,
      analytics: this.analytics(null),
    };
  }

  listByCategory(category: IconCategory) {
    return this.icons.filter((i) => i.category === category);
  }

  get(id: string) {
    const icon = this.icons.find((i) => i.id === id);
    if (!icon) throw new NotFoundException(`Icon ${id} not found`);
    return icon;
  }

  view(id: string, userId: number, tone: IconTone = 'neutral') {
    const icon = this.get(id);
    const event: IconViewEvent = {
      id: `iv-${this.viewSeq++}`,
      iconId: icon.id,
      category: icon.category,
      tone,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.views.push(event);
    if (tone === 'critical') {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL ICON STATE',
        message: `${icon.name} viewed with critical red accent.`,
        forgeStatus: 'failed',
      });
    }
    return { icon, event, analytics: this.analytics(userId) };
  }

  analytics(userId: number | null): IconographyAnalytics {
    const categoryCounts = CATEGORIES.reduce(
      (acc, c) => {
        acc[c] = 0;
        return acc;
      },
      {} as Record<IconCategory, number>,
    );
    for (const icon of this.icons) {
      categoryCounts[icon.category] += 1;
    }
    const viewCount = this.views.length;
    const criticalSelections = this.views.filter((v) => v.tone === 'critical')
      .length;
    const covered = CATEGORIES.filter((c) => categoryCounts[c] > 0).length;
    const iconCoverageScore = Math.min(
      100,
      Math.round((covered / CATEGORIES.length) * 70 + Math.min(viewCount, 30)),
    );
    return {
      totalIcons: this.icons.length,
      categoryCounts,
      viewCount,
      criticalSelections,
      iconCoverageScore,
      timestamp: new Date().toISOString(),
      userId,
    };
  }
}

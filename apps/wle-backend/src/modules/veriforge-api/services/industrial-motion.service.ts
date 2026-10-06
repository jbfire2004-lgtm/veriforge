import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type MotionCategory =
  | 'logo'
  | 'button'
  | 'panel'
  | 'card'
  | 'workflow'
  | 'notification'
  | 'chart';

export type MotionWeight = 'fast' | 'medium' | 'heavy';
export type MotionSignal = 'active' | 'critical' | 'neutral' | 'intentional';

export type MotionSpec = {
  id: string;
  category: MotionCategory;
  name: string;
  description: string;
  durationMs: number;
  weight: MotionWeight;
  easing: string;
  cssClass: string;
  signal: MotionSignal;
  principles: string[];
  timestamp: string;
  userId: number;
};

export type MotionPlayEvent = {
  id: string;
  specId: string;
  category: MotionCategory;
  signal: MotionSignal;
  timestamp: string;
  userId: number;
};

export type MotionAnalytics = {
  totalSpecs: number;
  categoryCounts: Record<MotionCategory, number>;
  playCount: number;
  criticalPlays: number;
  averageDurationMs: number;
  motionCoverageScore: number;
  timestamp: string;
  userId: number | null;
};

const EASE_ANGULAR = 'cubic-bezier(0.2, 0.0, 0.0, 1)';
const EASE_INDUSTRIAL = 'cubic-bezier(0.33, 0.0, 0.2, 1)';
const EASE_REBOUND = 'cubic-bezier(0.34, 1.2, 0.64, 1)';

@Injectable()
export class IndustrialMotionService {
  private playSeq = 1;
  private specs: MotionSpec[] = [];
  private plays: MotionPlayEvent[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    const userId = 1;
    this.specs = [
      {
        id: 'mot-logo-glow',
        category: 'logo',
        name: 'Forged V Red Glow',
        description: 'Emblem glows forge red with industrial pulse',
        durationMs: 1800,
        weight: 'heavy',
        easing: EASE_INDUSTRIAL,
        cssClass: 'vf-motion-logo-glow',
        signal: 'active',
        principles: ['Red glow activation', 'Heavy industrial weight'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-logo-shine',
        category: 'logo',
        name: 'Metallic Shine Sweep',
        description: 'Angular metallic shine across forged V',
        durationMs: 1600,
        weight: 'heavy',
        easing: EASE_INDUSTRIAL,
        cssClass: 'vf-motion-logo-shine',
        signal: 'neutral',
        principles: ['Metallic transitions', 'Angular movement'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-logo-expand',
        category: 'logo',
        name: 'Angular Expansion',
        description: 'Logo expands with angular skew settle',
        durationMs: 500,
        weight: 'heavy',
        easing: EASE_ANGULAR,
        cssClass: 'vf-motion-logo',
        signal: 'intentional',
        principles: ['Angular movement', 'Precision timing'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-btn-glow',
        category: 'button',
        name: 'Red Metallic Hover Glow',
        description: 'Primary CTA glow on hover',
        durationMs: 150,
        weight: 'fast',
        easing: EASE_ANGULAR,
        cssClass: 'vf-motion-btn',
        signal: 'active',
        principles: ['Red glow activation', 'Fast activation'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-btn-press',
        category: 'button',
        name: 'Angular Press',
        description: 'Press skew + translate with rebound',
        durationMs: 150,
        weight: 'fast',
        easing: EASE_REBOUND,
        cssClass: 'vf-motion-btn-rebound',
        signal: 'intentional',
        principles: ['Angular movement', 'Steel-grey rebound'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-panel-slide',
        category: 'panel',
        name: 'Angular Slide-In',
        description: 'Panel enters with metallic fade',
        durationMs: 280,
        weight: 'medium',
        easing: EASE_ANGULAR,
        cssClass: 'vf-motion-panel',
        signal: 'intentional',
        principles: ['Angular movement', 'Metallic transitions'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-panel-accent',
        category: 'panel',
        name: 'Red Accent Line Reveal',
        description: 'Forge-red rule scales in from left',
        durationMs: 280,
        weight: 'medium',
        easing: EASE_ANGULAR,
        cssClass: 'vf-motion-accent-line',
        signal: 'active',
        principles: ['Red glow activation', 'Precision timing'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-card-lift',
        category: 'card',
        name: 'Angular Lift Hover',
        description: 'Card lifts with metallic shadow expansion',
        durationMs: 280,
        weight: 'medium',
        easing: EASE_ANGULAR,
        cssClass: 'vf-motion-card',
        signal: 'intentional',
        principles: ['Angular movement', 'Metallic transitions'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-card-active',
        category: 'card',
        name: 'Active Red Glow',
        description: 'Active card border + red metallic glow',
        durationMs: 150,
        weight: 'fast',
        easing: EASE_ANGULAR,
        cssClass: 'vf-motion-card-active',
        signal: 'active',
        principles: ['Red glow = active or critical'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-wf-node',
        category: 'workflow',
        name: 'Node Activation',
        description: 'Angular node scale + glow',
        durationMs: 150,
        weight: 'fast',
        easing: EASE_ANGULAR,
        cssClass: 'vf-motion-node',
        signal: 'active',
        principles: ['Angular node activation', 'Precision timing'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-wf-connector',
        category: 'workflow',
        name: 'Connector Pulse',
        description: 'Metallic connector pulse between nodes',
        durationMs: 1100,
        weight: 'heavy',
        easing: EASE_INDUSTRIAL,
        cssClass: 'vf-motion-connector',
        signal: 'neutral',
        principles: ['Metallic connector pulse'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-notif-drop',
        category: 'notification',
        name: 'Angular Drop-In',
        description: 'Notification drops in with angular settle',
        durationMs: 280,
        weight: 'medium',
        easing: EASE_ANGULAR,
        cssClass: 'vf-motion-notif',
        signal: 'intentional',
        principles: ['Angular drop-in'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-notif-critical',
        category: 'notification',
        name: 'Critical Red Flash',
        description: 'Red metallic flash for critical alerts',
        durationMs: 900,
        weight: 'heavy',
        easing: EASE_INDUSTRIAL,
        cssClass: 'vf-motion-notif-critical',
        signal: 'critical',
        principles: ['Red metallic flash', 'Red glow = critical'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-chart-line',
        category: 'chart',
        name: 'Metallic Line Draw',
        description: 'SVG stroke draws with industrial easing',
        durationMs: 500,
        weight: 'heavy',
        easing: EASE_ANGULAR,
        cssClass: 'vf-motion-line',
        signal: 'intentional',
        principles: ['Metallic line draw', 'Heavy industrial motions'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-chart-bar',
        category: 'chart',
        name: 'Angular Bar Rise',
        description: 'Bars rise from baseline',
        durationMs: 500,
        weight: 'heavy',
        easing: EASE_ANGULAR,
        cssClass: 'vf-motion-bar',
        signal: 'intentional',
        principles: ['Angular bar rise'],
        timestamp: now,
        userId,
      },
      {
        id: 'mot-chart-kpi',
        category: 'chart',
        name: 'Critical KPI Pulse',
        description: 'Red highlight pulse for critical KPIs',
        durationMs: 1200,
        weight: 'heavy',
        easing: EASE_INDUSTRIAL,
        cssClass: 'vf-motion-kpi-pulse',
        signal: 'critical',
        principles: ['Red highlight pulse', 'Red glow = critical'],
        timestamp: now,
        userId,
      },
    ];
  }

  overview() {
    return {
      principles: [
        'Angular movement',
        'Metallic transitions',
        'Red glow activation',
        'Heavy industrial weight',
        'Precision timing',
      ],
      timing: {
        fast: '120–180ms',
        medium: '240–320ms',
        heavy: '400–600ms',
        easing: [EASE_ANGULAR, EASE_INDUSTRIAL, EASE_REBOUND],
      },
      interactionRules: [
        'Red glow = active or critical',
        'Metallic fade = neutral',
        'Angular movement = intentional action',
      ],
      specs: this.specs,
      recentPlays: this.plays.slice(0, 20),
      analytics: this.analytics(),
    };
  }

  analytics(userId: number | null = null): MotionAnalytics {
    const categories: MotionCategory[] = [
      'logo',
      'button',
      'panel',
      'card',
      'workflow',
      'notification',
      'chart',
    ];
    const categoryCounts = Object.fromEntries(
      categories.map((c) => [c, this.specs.filter((s) => s.category === c).length]),
    ) as Record<MotionCategory, number>;
    const covered = categories.filter((c) => categoryCounts[c] > 0).length;
    return {
      totalSpecs: this.specs.length,
      categoryCounts,
      playCount: this.plays.length,
      criticalPlays: this.plays.filter((p) => p.signal === 'critical').length,
      averageDurationMs:
        this.specs.length === 0
          ? 0
          : Math.round(
              this.specs.reduce((s, x) => s + x.durationMs, 0) / this.specs.length,
            ),
      motionCoverageScore: Math.round((covered / categories.length) * 100),
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  play(specId: string, userId: number) {
    const spec = this.specs.find((s) => s.id === specId);
    if (!spec) throw new NotFoundException(`Motion spec ${specId} not found`);
    const event: MotionPlayEvent = {
      id: `play-${this.playSeq++}`,
      specId: spec.id,
      category: spec.category,
      signal: spec.signal,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.plays.unshift(event);
    if (spec.signal === 'critical') {
      this.notifications.enqueue({
        title: 'CRITICAL MOTION SIGNAL',
        message: `${spec.name} played — red metallic critical path.`,
        category: 'compliance',
        forgeStatus: 'failed',
      });
    }
    return { event, spec, analytics: this.analytics(userId) };
  }

  listByCategory(category: MotionCategory) {
    return this.specs.filter((s) => s.category === category);
  }
}

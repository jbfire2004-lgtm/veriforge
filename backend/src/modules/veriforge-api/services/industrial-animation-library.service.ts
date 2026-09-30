import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type AnimationPrimitive =
  | 'angularSlide'
  | 'metallicFade'
  | 'redGlowPulse'
  | 'bevelShift'
  | 'industrialDrop';

export type AnimationComponent =
  | 'buttons'
  | 'cards'
  | 'panels'
  | 'modals'
  | 'workflow'
  | 'charts';

export type AnimationWeight = 'fast' | 'medium' | 'heavy';
export type AnimationSignal = 'active' | 'critical' | 'neutral' | 'intentional';

export type AnimationSpec = {
  id: string;
  name: string;
  category: 'primitive' | AnimationComponent;
  primitive?: AnimationPrimitive;
  description: string;
  durationMs: number;
  weight: AnimationWeight;
  easing: string;
  cssClass: string;
  signal: AnimationSignal;
  principles: string[];
  timestamp: string;
  userId: number;
};

export type AnimationPlayEvent = {
  id: string;
  specId: string;
  category: AnimationSpec['category'];
  signal: AnimationSignal;
  timestamp: string;
  userId: number;
};

export type AnimationAnalytics = {
  totalSpecs: number;
  playCount: number;
  criticalPlays: number;
  primitiveCount: number;
  componentCount: number;
  averageDurationMs: number;
  animationCoverageScore: number;
  timestamp: string;
  userId: number | null;
};

const EASE_ANGULAR = 'cubic-bezier(0.2, 0.0, 0.0, 1)';
const EASE_INDUSTRIAL = 'cubic-bezier(0.33, 0.0, 0.2, 1)';
const EASE_REBOUND = 'cubic-bezier(0.34, 1.2, 0.64, 1)';

@Injectable()
export class IndustrialAnimationLibraryService {
  private playSeq = 1;
  private specs: AnimationSpec[] = [];
  private plays: AnimationPlayEvent[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    const userId = 1;
    const rows: Omit<AnimationSpec, 'timestamp' | 'userId'>[] = [
      {
        id: 'an-prim-slide',
        name: 'Angular Slide',
        category: 'primitive',
        primitive: 'angularSlide',
        description: 'Linear, sharp directional movement — no curves',
        durationMs: 280,
        weight: 'medium',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-angular-slide',
        signal: 'intentional',
        principles: ['Angular movement', 'Precision timing'],
      },
      {
        id: 'an-prim-fade',
        name: 'Metallic Fade',
        category: 'primitive',
        primitive: 'metallicFade',
        description: 'Gradient fade from steel-grey to black',
        durationMs: 280,
        weight: 'medium',
        easing: EASE_INDUSTRIAL,
        cssClass: 'vf-anim-metallic-fade',
        signal: 'neutral',
        principles: ['Metallic transitions', 'Heavy industrial weight'],
      },
      {
        id: 'an-prim-glow',
        name: 'Red Glow Pulse',
        category: 'primitive',
        primitive: 'redGlowPulse',
        description: 'Critical activation pulse in forge red',
        durationMs: 1000,
        weight: 'heavy',
        easing: EASE_INDUSTRIAL,
        cssClass: 'vf-anim-red-glow-pulse',
        signal: 'critical',
        principles: ['Red glow activation', 'Heavy industrial weight'],
      },
      {
        id: 'an-prim-bevel',
        name: 'Bevel Shift',
        category: 'primitive',
        primitive: 'bevelShift',
        description: 'Metallic edge highlight movement',
        durationMs: 1400,
        weight: 'heavy',
        easing: EASE_INDUSTRIAL,
        cssClass: 'vf-anim-bevel-shift',
        signal: 'active',
        principles: ['Metallic transitions', 'Angular movement'],
      },
      {
        id: 'an-prim-drop',
        name: 'Industrial Drop',
        category: 'primitive',
        primitive: 'industrialDrop',
        description: 'Heavy downward motion with angular deceleration',
        durationMs: 500,
        weight: 'heavy',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-industrial-drop',
        signal: 'intentional',
        principles: ['Heavy industrial weight', 'Precision timing'],
      },
      {
        id: 'an-btn-hover',
        name: 'Button Hover Glow',
        category: 'buttons',
        description: 'Red metallic glow on hover',
        durationMs: 150,
        weight: 'fast',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-btn-hover',
        signal: 'active',
        principles: ['Red glow activation', 'Fast activation'],
      },
      {
        id: 'an-btn-press',
        name: 'Button Angular Press',
        category: 'buttons',
        description: 'Angular compression on press',
        durationMs: 150,
        weight: 'fast',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-btn-press',
        signal: 'intentional',
        principles: ['Angular movement', 'Precision timing'],
      },
      {
        id: 'an-btn-release',
        name: 'Button Steel Rebound',
        category: 'buttons',
        description: 'Steel-grey rebound on release',
        durationMs: 150,
        weight: 'fast',
        easing: EASE_REBOUND,
        cssClass: 'vf-anim-btn-rebound',
        signal: 'neutral',
        principles: ['Metallic transitions', 'Precision timing'],
      },
      {
        id: 'an-card-hover',
        name: 'Card Angular Lift',
        category: 'cards',
        description: 'Angular lift + metallic shadow expansion',
        durationMs: 280,
        weight: 'medium',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-card-lift',
        signal: 'intentional',
        principles: ['Angular movement', 'Metallic transitions'],
      },
      {
        id: 'an-card-active',
        name: 'Card Active Glow',
        category: 'cards',
        description: 'Red glow pulse for active state',
        durationMs: 1000,
        weight: 'heavy',
        easing: EASE_INDUSTRIAL,
        cssClass: 'vf-anim-card-active',
        signal: 'critical',
        principles: ['Red glow activation'],
      },
      {
        id: 'an-card-dismiss',
        name: 'Card Angular Dismiss',
        category: 'cards',
        description: 'Angular slide-out dismiss',
        durationMs: 280,
        weight: 'medium',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-card-dismiss',
        signal: 'intentional',
        principles: ['Angular movement'],
      },
      {
        id: 'an-panel-in',
        name: 'Panel Slide-In',
        category: 'panels',
        description: 'Angular direction + metallic fade',
        durationMs: 280,
        weight: 'medium',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-panel-in',
        signal: 'intentional',
        principles: ['Angular movement', 'Metallic transitions'],
      },
      {
        id: 'an-panel-expand',
        name: 'Panel Expand Bevel',
        category: 'panels',
        description: 'Bevel shift + red accent reveal',
        durationMs: 280,
        weight: 'medium',
        easing: EASE_INDUSTRIAL,
        cssClass: 'vf-anim-panel-expand',
        signal: 'active',
        principles: ['Metallic transitions', 'Red glow activation'],
      },
      {
        id: 'an-modal-open',
        name: 'Modal Industrial Drop',
        category: 'modals',
        description: 'Industrial drop + metallic fade',
        durationMs: 500,
        weight: 'heavy',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-modal-open',
        signal: 'intentional',
        principles: ['Heavy industrial weight', 'Metallic transitions'],
      },
      {
        id: 'an-modal-close',
        name: 'Modal Angular Collapse',
        category: 'modals',
        description: 'Angular collapse on close',
        durationMs: 500,
        weight: 'heavy',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-modal-close',
        signal: 'intentional',
        principles: ['Angular movement', 'Heavy industrial weight'],
      },
      {
        id: 'an-wf-activate',
        name: 'Node Activation Glow',
        category: 'workflow',
        description: 'Red glow pulse on node activation',
        durationMs: 150,
        weight: 'fast',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-node-activate',
        signal: 'active',
        principles: ['Red glow activation'],
      },
      {
        id: 'an-wf-connect',
        name: 'Metallic Connector Draw',
        category: 'workflow',
        description: 'Metallic line draw between nodes',
        durationMs: 500,
        weight: 'heavy',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-connector-draw',
        signal: 'neutral',
        principles: ['Metallic transitions'],
      },
      {
        id: 'an-wf-error',
        name: 'Node Error Shake',
        category: 'workflow',
        description: 'Angular shake + red flash',
        durationMs: 400,
        weight: 'heavy',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-node-error',
        signal: 'critical',
        principles: ['Angular movement', 'Red glow activation'],
      },
      {
        id: 'an-chart-line',
        name: 'Metallic Line Draw',
        category: 'charts',
        description: 'Metallic stroke animation',
        durationMs: 500,
        weight: 'heavy',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-chart-line',
        signal: 'neutral',
        principles: ['Metallic transitions', 'Precision timing'],
      },
      {
        id: 'an-chart-bar',
        name: 'Angular Bar Rise',
        category: 'charts',
        description: 'Angular upward bar motion',
        durationMs: 500,
        weight: 'heavy',
        easing: EASE_ANGULAR,
        cssClass: 'vf-anim-chart-bar',
        signal: 'intentional',
        principles: ['Angular movement'],
      },
      {
        id: 'an-chart-kpi',
        name: 'KPI Red Pulse',
        category: 'charts',
        description: 'Red highlight pulse for critical KPIs',
        durationMs: 1200,
        weight: 'heavy',
        easing: EASE_INDUSTRIAL,
        cssClass: 'vf-anim-kpi-pulse',
        signal: 'critical',
        principles: ['Red glow activation'],
      },
    ];
    this.specs = rows.map((r) => ({ ...r, timestamp: now, userId }));
  }

  overview() {
    return {
      principles: [
        'Angular movement (no curves)',
        'Metallic transitions',
        'Red glow activation',
        'Heavy industrial weight',
        'Precision timing (120–600ms)',
      ],
      timing: {
        fast: '120–180ms',
        medium: '240–320ms',
        heavy: '400–600ms',
        easing: {
          angular: EASE_ANGULAR,
          industrial: EASE_INDUSTRIAL,
          rebound: EASE_REBOUND,
        },
      },
      specs: this.specs,
      analytics: this.analytics(null),
    };
  }

  listByCategory(category: AnimationSpec['category']) {
    return this.specs.filter((s) => s.category === category);
  }

  get(id: string) {
    const spec = this.specs.find((s) => s.id === id);
    if (!spec) throw new NotFoundException(`Animation ${id} not found`);
    return spec;
  }

  play(id: string, userId: number) {
    const spec = this.get(id);
    const event: AnimationPlayEvent = {
      id: `ap-${this.playSeq++}`,
      specId: spec.id,
      category: spec.category,
      signal: spec.signal,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.plays.push(event);
    if (spec.signal === 'critical') {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL ANIMATION SIGNAL',
        message: `${spec.name} — red glow / error path activated.`,
        forgeStatus: 'failed',
      });
    }
    return { spec, event, analytics: this.analytics(userId) };
  }

  analytics(userId: number | null): AnimationAnalytics {
    const primitiveCount = this.specs.filter((s) => s.category === 'primitive')
      .length;
    const componentCount = this.specs.length - primitiveCount;
    const playCount = this.plays.length;
    const criticalPlays = this.plays.filter((p) => p.signal === 'critical')
      .length;
    const averageDurationMs = Math.round(
      this.specs.reduce((s, a) => s + a.durationMs, 0) /
        Math.max(1, this.specs.length),
    );
    const animationCoverageScore = Math.min(
      100,
      Math.round((this.specs.length / 21) * 70 + Math.min(playCount, 30)),
    );
    return {
      totalSpecs: this.specs.length,
      playCount,
      criticalPlays,
      primitiveCount,
      componentCount,
      averageDurationMs,
      animationCoverageScore,
      timestamp: new Date().toISOString(),
      userId,
    };
  }
}

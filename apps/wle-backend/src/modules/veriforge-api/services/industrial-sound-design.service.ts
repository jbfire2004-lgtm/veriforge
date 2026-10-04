import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type SoundCategory =
  | 'ui'
  | 'workflow'
  | 'notification'
  | 'verification'
  | 'incident'
  | 'equipment'
  | 'motion';

export type SoundSignal = 'neutral' | 'success' | 'warning' | 'critical' | 'failure';
export type SoundWeight = 'light' | 'medium' | 'heavy';

export type SoundSpec = {
  id: string;
  category: SoundCategory;
  name: string;
  description: string;
  cue: string;
  durationMs: number;
  weight: SoundWeight;
  signal: SoundSignal;
  principles: string[];
  timestamp: string;
  userId: number;
};

export type SoundPlayEvent = {
  id: string;
  soundId: string;
  category: SoundCategory;
  signal: SoundSignal;
  timestamp: string;
  userId: number;
};

export type SoundAnalytics = {
  totalSounds: number;
  playCount: number;
  criticalPlays: number;
  categoryCounts: Record<SoundCategory, number>;
  soundCoverageScore: number;
  timestamp: string;
  userId: number | null;
};

const CATEGORIES: SoundCategory[] = [
  'ui',
  'workflow',
  'notification',
  'verification',
  'incident',
  'equipment',
  'motion',
];

@Injectable()
export class IndustrialSoundDesignService {
  private playSeq = 1;
  private sounds: SoundSpec[] = [];
  private plays: SoundPlayEvent[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    const userId = 1;
    const rows: Omit<SoundSpec, 'timestamp' | 'userId'>[] = [
      {
        id: 'snd-ui-tap',
        category: 'ui',
        name: 'Button Tap',
        description: 'Short metallic click',
        cue: 'metalClick',
        durationMs: 80,
        weight: 'light',
        signal: 'neutral',
        principles: ['Angular tonality', 'Precision timing'],
      },
      {
        id: 'snd-ui-hover',
        category: 'ui',
        name: 'Hover Shimmer',
        description: 'Faint steel shimmer',
        cue: 'steelShimmer',
        durationMs: 160,
        weight: 'light',
        signal: 'neutral',
        principles: ['Metallic resonance', 'Steel-grey resonance'],
      },
      {
        id: 'snd-ui-card',
        category: 'ui',
        name: 'Card Lift',
        description: 'Angular metallic lift tone',
        cue: 'metalLift',
        durationMs: 220,
        weight: 'medium',
        signal: 'neutral',
        principles: ['Angular tonality', 'Metallic resonance'],
      },
      {
        id: 'snd-wf-node',
        category: 'workflow',
        name: 'Node Activation',
        description: 'Sharp forged-metal ping',
        cue: 'forgePing',
        durationMs: 140,
        weight: 'medium',
        signal: 'success',
        principles: ['Metallic resonance', 'Sharp transients'],
      },
      {
        id: 'snd-wf-connect',
        category: 'workflow',
        name: 'Connection Draw',
        description: 'Metallic sweep',
        cue: 'metalSweep',
        durationMs: 420,
        weight: 'medium',
        signal: 'neutral',
        principles: ['Metallic resonance', 'Precision timing'],
      },
      {
        id: 'snd-wf-error',
        category: 'workflow',
        name: 'Workflow Error',
        description: 'Angular metallic snap + red-alert tone',
        cue: 'metalSnapAlert',
        durationMs: 380,
        weight: 'heavy',
        signal: 'critical',
        principles: ['Red-alert urgency', 'Angular tonality'],
      },
      {
        id: 'snd-ntf-critical',
        category: 'notification',
        name: 'Critical Alert',
        description: 'Red-alert metallic strike',
        cue: 'redAlertStrike',
        durationMs: 450,
        weight: 'heavy',
        signal: 'critical',
        principles: ['Red-alert urgency', 'Heavy industrial weight'],
      },
      {
        id: 'snd-ntf-warning',
        category: 'notification',
        name: 'Warning Pulse',
        description: 'Steel-grey pulse',
        cue: 'steelPulse',
        durationMs: 320,
        weight: 'medium',
        signal: 'warning',
        principles: ['Steel-grey resonance', 'Precision timing'],
      },
      {
        id: 'snd-ntf-info',
        category: 'notification',
        name: 'Info Tap',
        description: 'Soft metallic tap',
        cue: 'softMetalTap',
        durationMs: 100,
        weight: 'light',
        signal: 'neutral',
        principles: ['Metallic resonance', 'Precision timing'],
      },
      {
        id: 'snd-ver-pass',
        category: 'verification',
        name: 'forgeCheck Pass',
        description: 'Ascending metallic chime',
        cue: 'ascendChime',
        durationMs: 480,
        weight: 'medium',
        signal: 'success',
        principles: ['Warm metallic chimes', 'Metallic resonance'],
      },
      {
        id: 'snd-ver-fail',
        category: 'verification',
        name: 'forgeCheck Fail',
        description: 'Descending angular tone',
        cue: 'descendAngular',
        durationMs: 420,
        weight: 'medium',
        signal: 'failure',
        principles: ['Angular descending tones', 'Sharp transients'],
      },
      {
        id: 'snd-ver-expiry',
        category: 'verification',
        name: 'Compliance Expiry',
        description: 'Red-alert pulse',
        cue: 'redAlertPulse',
        durationMs: 600,
        weight: 'heavy',
        signal: 'critical',
        principles: ['Red-alert urgency', 'Rising metallic pitch'],
      },
      {
        id: 'snd-inc-alert',
        category: 'incident',
        name: 'Incident Alert',
        description: 'Heavy metallic impact',
        cue: 'heavyImpact',
        durationMs: 500,
        weight: 'heavy',
        signal: 'critical',
        principles: ['Heavy industrial weight', 'Metallic hits'],
      },
      {
        id: 'snd-inc-emergency',
        category: 'incident',
        name: 'Emergency Siren',
        description: 'Repeating red-alert siren pulse',
        cue: 'redSirenPulse',
        durationMs: 1200,
        weight: 'heavy',
        signal: 'critical',
        principles: ['Red-alert urgency', 'Repeating pulse'],
      },
      {
        id: 'snd-inc-muster',
        category: 'incident',
        name: 'Muster Beacon',
        description: 'Steel-grey beacon tone',
        cue: 'steelBeacon',
        durationMs: 700,
        weight: 'medium',
        signal: 'warning',
        principles: ['Steel-grey resonance', 'Precision timing'],
      },
      {
        id: 'snd-eq-pass',
        category: 'equipment',
        name: 'Inspection Pass',
        description: 'Metallic tick',
        cue: 'metalTick',
        durationMs: 90,
        weight: 'light',
        signal: 'success',
        principles: ['Metallic resonance', 'Precision timing'],
      },
      {
        id: 'snd-eq-defect',
        category: 'equipment',
        name: 'Defect Found',
        description: 'Angular metallic snap',
        cue: 'metalSnap',
        durationMs: 200,
        weight: 'medium',
        signal: 'failure',
        principles: ['Angular tonality', 'Metallic clanks'],
      },
      {
        id: 'snd-eq-gps',
        category: 'equipment',
        name: 'GPS Check-in',
        description: 'Steel resonance ping',
        cue: 'steelPing',
        durationMs: 260,
        weight: 'light',
        signal: 'neutral',
        principles: ['Metallic resonance', 'Steel-grey resonance'],
      },
      {
        id: 'snd-mot-panel',
        category: 'motion',
        name: 'Panel Slide',
        description: 'Metallic glide',
        cue: 'metalGlide',
        durationMs: 320,
        weight: 'medium',
        signal: 'neutral',
        principles: ['Metallic scrapes', 'Precision timing'],
      },
      {
        id: 'snd-mot-modal',
        category: 'motion',
        name: 'Modal Drop',
        description: 'Heavy industrial thud',
        cue: 'industrialThud',
        durationMs: 380,
        weight: 'heavy',
        signal: 'neutral',
        principles: ['Heavy industrial weight', 'Low-mid emphasis'],
      },
      {
        id: 'snd-mot-chart',
        category: 'motion',
        name: 'Chart Sweep',
        description: 'Steel line sweep',
        cue: 'steelLineSweep',
        durationMs: 500,
        weight: 'medium',
        signal: 'neutral',
        principles: ['Metallic resonance', 'Precision timing'],
      },
    ];
    this.sounds = rows.map((r) => ({ ...r, timestamp: now, userId }));
  }

  overview() {
    return {
      principles: [
        'Metallic resonance',
        'Angular tonality',
        'Heavy industrial weight',
        'Red-alert urgency',
        'Precision timing',
      ],
      categories: CATEGORIES,
      sounds: this.sounds,
      analytics: this.analytics(null),
    };
  }

  listByCategory(category: SoundCategory) {
    return this.sounds.filter((s) => s.category === category);
  }

  get(id: string) {
    const sound = this.sounds.find((s) => s.id === id);
    if (!sound) throw new NotFoundException(`Sound ${id} not found`);
    return sound;
  }

  play(id: string, userId: number) {
    const sound = this.get(id);
    const event: SoundPlayEvent = {
      id: `sp-${this.playSeq++}`,
      soundId: sound.id,
      category: sound.category,
      signal: sound.signal,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.plays.push(event);
    if (sound.signal === 'critical') {
      this.notifications.enqueue({
        category: 'compliance',
        title: 'CRITICAL SOUND CUE',
        message: `${sound.name} — red-alert metallic cue fired.`,
        forgeStatus: 'failed',
      });
    }
    return { sound, event, analytics: this.analytics(userId) };
  }

  analytics(userId: number | null): SoundAnalytics {
    const categoryCounts = CATEGORIES.reduce(
      (acc, c) => {
        acc[c] = 0;
        return acc;
      },
      {} as Record<SoundCategory, number>,
    );
    for (const s of this.sounds) categoryCounts[s.category] += 1;
    const playCount = this.plays.length;
    const criticalPlays = this.plays.filter((p) => p.signal === 'critical')
      .length;
    const covered = CATEGORIES.filter((c) => categoryCounts[c] > 0).length;
    const soundCoverageScore = Math.min(
      100,
      Math.round((covered / CATEGORIES.length) * 70 + Math.min(playCount, 30)),
    );
    return {
      totalSounds: this.sounds.length,
      playCount,
      criticalPlays,
      categoryCounts,
      soundCoverageScore,
      timestamp: new Date().toISOString(),
      userId,
    };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type CulturePillar =
  | 'leadership'
  | 'empowerment'
  | 'training'
  | 'verification'
  | 'transparency'
  | 'improvement';

export type BehaviorTone = 'positive' | 'at_risk';
export type CampaignStatus = 'planned' | 'active' | 'completed';
export type SuggestionStatus = 'open' | 'reviewing' | 'implemented' | 'declined';
export type ImprovementPriority = 'normal' | 'priority';

export type CultureBehavior = {
  id: string;
  title: string;
  description: string;
  tone: BehaviorTone;
  location: string;
  category: CulturePillar;
  timestamp: string;
  userId: number;
};

export type CultureCampaign = {
  id: string;
  title: string;
  description: string;
  status: CampaignStatus;
  participation: number;
  completion: number;
  impact: number;
  category: CulturePillar;
  timestamp: string;
  userId: number;
};

export type LeadershipAction = {
  id: string;
  title: string;
  coach: string;
  feedback: string;
  priority: boolean;
  status: 'open' | 'in_progress' | 'done';
  category: CulturePillar;
  timestamp: string;
  userId: number;
};

export type WorkerSuggestion = {
  id: string;
  title: string;
  detail: string;
  anonymous: boolean;
  status: SuggestionStatus;
  implementationPercent: number;
  category: CulturePillar;
  timestamp: string;
  userId: number | null;
};

export type ImprovementItem = {
  id: string;
  title: string;
  detail: string;
  priority: ImprovementPriority;
  progress: number;
  category: CulturePillar;
  timestamp: string;
  userId: number;
};

export type CultureAnalytics = {
  cultureScore: number;
  leadershipEngagement: number;
  workerEmpowerment: number;
  trainingExcellence: number;
  verificationDiscipline: number;
  incidentTransparency: number;
  continuousImprovement: number;
  positiveBehaviors: number;
  atRiskBehaviors: number;
  activeCampaigns: number;
  openSuggestions: number;
  priorityGaps: number;
  correctiveActionClosure: number;
  timestamp: string;
  userId: number | null;
};

@Injectable()
export class SafetyCultureService {
  private behaviorSeq = 3;
  private campaignSeq = 2;
  private actionSeq = 2;
  private suggestionSeq = 2;
  private improvementSeq = 2;

  private behaviors: CultureBehavior[] = [];
  private campaigns: CultureCampaign[] = [];
  private leadership: LeadershipAction[] = [];
  private suggestions: WorkerSuggestion[] = [];
  private improvements: ImprovementItem[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    this.behaviors = [
      {
        id: 'beh-1',
        title: 'Pre-task brief completed',
        description: 'Crew ran full LOTO brief before hot work.',
        tone: 'positive',
        location: 'Bay 4',
        category: 'verification',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'beh-2',
        title: 'PPE shortcut observed',
        description: 'Operator entered cell without FR sleeves.',
        tone: 'at_risk',
        location: 'Weld Cell',
        category: 'training',
        timestamp: now,
        userId: 1,
      },
    ];
    this.campaigns = [
      {
        id: 'cmp-1',
        title: 'Forge Eyes On',
        description: 'Peer observation campaign for verification discipline.',
        status: 'active',
        participation: 72,
        completion: 58,
        impact: 64,
        category: 'verification',
        timestamp: now,
        userId: 1,
      },
    ];
    this.leadership = [
      {
        id: 'lead-1',
        title: 'Coach night-shift supervisors',
        coach: 'A. Mercer',
        feedback: 'Reinforce stop-work authority language on floor walks.',
        priority: true,
        status: 'open',
        category: 'leadership',
        timestamp: now,
        userId: 1,
      },
    ];
    this.suggestions = [
      {
        id: 'sug-1',
        title: 'Add spark screen checklist',
        detail: 'Anonymous request for visual checklist at hot-work stations.',
        anonymous: true,
        status: 'reviewing',
        implementationPercent: 35,
        category: 'empowerment',
        timestamp: now,
        userId: null,
      },
    ];
    this.improvements = [
      {
        id: 'imp-1',
        title: 'Close overdue corrective actions',
        detail: 'Drive closure rate above 85% this quarter.',
        priority: 'priority',
        progress: 48,
        category: 'improvement',
        timestamp: now,
        userId: 1,
      },
    ];
    this.notifyGaps();
  }

  overview() {
    return {
      pillars: [
        'leadership',
        'empowerment',
        'training',
        'verification',
        'transparency',
        'improvement',
      ] as CulturePillar[],
      behaviors: this.behaviors,
      campaigns: this.campaigns,
      leadership: this.leadership,
      suggestions: this.suggestions,
      improvements: this.improvements,
      analytics: this.analytics(),
    };
  }

  analytics(userId: number | null = null): CultureAnalytics {
    const positiveBehaviors = this.behaviors.filter((b) => b.tone === 'positive').length;
    const atRiskBehaviors = this.behaviors.filter((b) => b.tone === 'at_risk').length;
    const activeCampaigns = this.campaigns.filter((c) => c.status === 'active').length;
    const openSuggestions = this.suggestions.filter(
      (s) => s.status === 'open' || s.status === 'reviewing',
    ).length;
    const priorityGaps = this.leadership.filter((a) => a.priority && a.status !== 'done')
      .length +
      this.improvements.filter((i) => i.priority === 'priority' && i.progress < 80).length +
      atRiskBehaviors;

    const leadershipEngagement = this.avg(
      this.leadership.map((a) => (a.status === 'done' ? 100 : a.priority ? 40 : 65)),
      62,
    );
    const workerEmpowerment = this.avg(
      this.suggestions.map((s) => s.implementationPercent),
      55,
    );
    const trainingExcellence = 84;
    const verificationDiscipline = this.avg(
      this.campaigns
        .filter((c) => c.category === 'verification')
        .map((c) => c.completion),
      70,
    );
    const incidentTransparency = 78;
    const continuousImprovement = this.avg(
      this.improvements.map((i) => i.progress),
      50,
    );
    const correctiveActionClosure = continuousImprovement;
    const cultureScore = Math.round(
      (leadershipEngagement +
        workerEmpowerment +
        trainingExcellence +
        verificationDiscipline +
        incidentTransparency +
        continuousImprovement) /
        6,
    );

    return {
      cultureScore,
      leadershipEngagement,
      workerEmpowerment,
      trainingExcellence,
      verificationDiscipline,
      incidentTransparency,
      continuousImprovement,
      positiveBehaviors,
      atRiskBehaviors,
      activeCampaigns,
      openSuggestions,
      priorityGaps,
      correctiveActionClosure,
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  logBehavior(
    input: {
      title: string;
      description: string;
      tone: BehaviorTone;
      location: string;
      category: CulturePillar;
    },
    userId: number,
  ) {
    const item: CultureBehavior = {
      id: `beh-${this.behaviorSeq++}`,
      ...input,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.behaviors.unshift(item);
    if (item.tone === 'at_risk') this.notifyGaps();
    return item;
  }

  createCampaign(
    input: {
      title: string;
      description: string;
      category: CulturePillar;
    },
    userId: number,
  ) {
    const item: CultureCampaign = {
      id: `cmp-${this.campaignSeq++}`,
      title: input.title,
      description: input.description,
      status: 'active',
      participation: 0,
      completion: 0,
      impact: 0,
      category: input.category,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.campaigns.unshift(item);
    return item;
  }

  updateCampaignMetrics(
    id: string,
    input: { participation?: number; completion?: number; impact?: number },
    userId: number,
  ) {
    const item = this.campaigns.find((c) => c.id === id);
    if (!item) throw new NotFoundException(`Campaign ${id} not found`);
    if (input.participation != null) item.participation = clamp(input.participation);
    if (input.completion != null) item.completion = clamp(input.completion);
    if (input.impact != null) item.impact = clamp(input.impact);
    item.userId = userId;
    return item;
  }

  createLeadershipAction(
    input: {
      title: string;
      coach: string;
      feedback: string;
      priority?: boolean;
      category?: CulturePillar;
    },
    userId: number,
  ) {
    const item: LeadershipAction = {
      id: `lead-${this.actionSeq++}`,
      title: input.title,
      coach: input.coach,
      feedback: input.feedback,
      priority: input.priority ?? false,
      status: 'open',
      category: input.category ?? 'leadership',
      timestamp: new Date().toISOString(),
      userId,
    };
    this.leadership.unshift(item);
    if (item.priority) this.notifyGaps();
    return item;
  }

  submitSuggestion(
    input: {
      title: string;
      detail: string;
      anonymous?: boolean;
      category?: CulturePillar;
    },
    userId: number | null,
  ) {
    const item: WorkerSuggestion = {
      id: `sug-${this.suggestionSeq++}`,
      title: input.title,
      detail: input.detail,
      anonymous: input.anonymous ?? true,
      status: 'open',
      implementationPercent: 0,
      category: input.category ?? 'empowerment',
      timestamp: new Date().toISOString(),
      userId: input.anonymous === false ? userId : null,
    };
    this.suggestions.unshift(item);
    return item;
  }

  advanceSuggestion(id: string, percent: number, userId: number) {
    const item = this.suggestions.find((s) => s.id === id);
    if (!item) throw new NotFoundException(`Suggestion ${id} not found`);
    item.implementationPercent = clamp(percent);
    item.status =
      item.implementationPercent >= 100
        ? 'implemented'
        : item.implementationPercent > 0
          ? 'reviewing'
          : 'open';
    if (!item.anonymous) item.userId = userId;
    return item;
  }

  createImprovement(
    input: {
      title: string;
      detail: string;
      priority?: ImprovementPriority;
      category?: CulturePillar;
    },
    userId: number,
  ) {
    const item: ImprovementItem = {
      id: `imp-${this.improvementSeq++}`,
      title: input.title,
      detail: input.detail,
      priority: input.priority ?? 'normal',
      progress: 0,
      category: input.category ?? 'improvement',
      timestamp: new Date().toISOString(),
      userId,
    };
    this.improvements.unshift(item);
    if (item.priority === 'priority') this.notifyGaps();
    return item;
  }

  bumpImprovement(id: string, delta: number, userId: number) {
    const item = this.improvements.find((i) => i.id === id);
    if (!item) throw new NotFoundException(`Improvement ${id} not found`);
    item.progress = clamp(item.progress + delta);
    item.userId = userId;
    return item;
  }

  private avg(values: number[], fallback: number) {
    if (values.length === 0) return fallback;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  private notifyGaps() {
    const analytics = this.analytics();
    if (analytics.priorityGaps <= 0 && analytics.cultureScore >= 70) return;
    this.notifications.enqueue({
      category: 'compliance',
      title: 'CULTURE GAP ALERT',
      message: `Culture score ${analytics.cultureScore}% with ${analytics.priorityGaps} priority gaps. At-risk behaviors: ${analytics.atRiskBehaviors}.`,
      forgeStatus: 'failed',
    });
  }
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

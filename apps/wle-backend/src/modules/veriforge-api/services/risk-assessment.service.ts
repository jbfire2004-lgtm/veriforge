import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type HazardCategory =
  | 'physical'
  | 'chemical'
  | 'biological'
  | 'ergonomic'
  | 'psychosocial'
  | 'environmental';

export type ControlType = 'engineering' | 'administrative' | 'ppe';
export type RiskBand = 'low' | 'moderate' | 'high' | 'critical';
export type ActionStatus = 'open' | 'in_progress' | 'done' | 'overdue';

export type RiskEvidence = {
  id: string;
  fileName: string;
  uploadedAt: string;
  userId: number;
};

export type RiskControl = {
  id: string;
  type: ControlType;
  name: string;
  description: string;
  implemented: boolean;
};

export type RiskCorrectiveAction = {
  id: string;
  name: string;
  responsiblePerson: string;
  dueDate: string;
  status: ActionStatus;
  createdAt: string;
};

export type RiskEntry = {
  id: string;
  hazardId: string;
  hazardType: string;
  description: string;
  location: string;
  category: HazardCategory;
  likelihood: number;
  severity: number;
  inherentScore: number;
  residualScore: number;
  band: RiskBand;
  residualBand: RiskBand;
  controls: RiskControl[];
  correctiveActions: RiskCorrectiveAction[];
  evidence: RiskEvidence[];
  reductionPercent: number;
  timestamp: string;
  userId: number;
  updatedAt: string;
};

export type RiskAnalytics = {
  totalHazards: number;
  highRiskCount: number;
  criticalCount: number;
  averageInherent: number;
  averageResidual: number;
  controlEffectiveness: number;
  openActions: number;
  distribution: Array<{ band: RiskBand; count: number }>;
  topHazards: Array<{ hazardId: string; title: string; score: number }>;
  matrix: number[][];
  timestamp: string;
  userId: number | null;
};

function clampScale(value: number) {
  return Math.max(1, Math.min(5, Math.round(value)));
}

function scoreBand(score: number): RiskBand {
  if (score >= 20) return 'critical';
  if (score >= 12) return 'high';
  if (score >= 6) return 'moderate';
  return 'low';
}

@Injectable()
export class RiskAssessmentService {
  private nextHazard = 3;
  private nextControl = 10;
  private nextAction = 10;
  private nextEvidence = 10;

  private entries: RiskEntry[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    this.entries = [
      this.buildEntry(
        {
          hazardType: 'Hot work spark exposure',
          description: 'Open flame near combustible storage during night shift.',
          location: 'Bay 4 · Weld Cell',
          category: 'physical',
          likelihood: 4,
          severity: 5,
          userId: 1,
        },
        now,
        'hz-1',
        [
          {
            id: 'ctl-1',
            type: 'engineering',
            name: 'Spark containment screen',
            description: 'Install fixed metallic spark barrier.',
            implemented: false,
          },
          {
            id: 'ctl-2',
            type: 'administrative',
            name: 'Hot work permit',
            description: 'Require signed permit before ignition.',
            implemented: true,
          },
          {
            id: 'ctl-3',
            type: 'ppe',
            name: 'FR clothing',
            description: 'Mandatory FR coveralls in cell.',
            implemented: true,
          },
        ],
        [
          {
            id: 'act-1',
            name: 'Install spark screen',
            responsiblePerson: 'M. Ortega',
            dueDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
            status: 'open',
            createdAt: now,
          },
        ],
      ),
      this.buildEntry(
        {
          hazardType: 'Solvent vapor inhalation',
          description: 'Degreaser use without local exhaust.',
          location: 'Paint Prep',
          category: 'chemical',
          likelihood: 3,
          severity: 3,
          userId: 1,
        },
        now,
        'hz-2',
        [
          {
            id: 'ctl-4',
            type: 'engineering',
            name: 'Local exhaust ventilation',
            description: 'Capture hood at degrease station.',
            implemented: true,
          },
          {
            id: 'ctl-5',
            type: 'ppe',
            name: 'Organic vapor respirator',
            description: 'Half-mask with OV cartridges.',
            implemented: false,
          },
        ],
        [
          {
            id: 'act-2',
            name: 'Issue respirators + fit test',
            responsiblePerson: 'S. Kim',
            dueDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
            status: 'in_progress',
            createdAt: now,
          },
        ],
      ),
    ];
    this.notifyHighRisk(this.entries[0]);
  }

  list() {
    return [...this.entries];
  }

  getById(id: string) {
    const entry = this.entries.find((item) => item.id === id || item.hazardId === id);
    if (!entry) throw new NotFoundException(`Risk entry ${id} not found`);
    return entry;
  }

  matrix() {
    const grid = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => 0));
    for (const entry of this.entries) {
      grid[5 - entry.likelihood][entry.severity - 1] += 1;
    }
    return grid;
  }

  analytics(userId: number | null = null): RiskAnalytics {
    const total = this.entries.length;
    const highRiskCount = this.entries.filter(
      (item) => item.band === 'high' || item.band === 'critical',
    ).length;
    const criticalCount = this.entries.filter((item) => item.band === 'critical').length;
    const averageInherent =
      total === 0
        ? 0
        : Math.round(
            this.entries.reduce((sum, item) => sum + item.inherentScore, 0) / total,
          );
    const averageResidual =
      total === 0
        ? 0
        : Math.round(
            this.entries.reduce((sum, item) => sum + item.residualScore, 0) / total,
          );
    const controlEffectiveness =
      total === 0
        ? 0
        : Math.round(
            this.entries.reduce((sum, item) => sum + item.reductionPercent, 0) / total,
          );
    const openActions = this.entries.reduce(
      (sum, item) =>
        sum +
        item.correctiveActions.filter((action) => action.status !== 'done').length,
      0,
    );
    const bands: RiskBand[] = ['low', 'moderate', 'high', 'critical'];
    return {
      totalHazards: total,
      highRiskCount,
      criticalCount,
      averageInherent,
      averageResidual,
      controlEffectiveness,
      openActions,
      distribution: bands.map((band) => ({
        band,
        count: this.entries.filter((item) => item.band === band).length,
      })),
      topHazards: [...this.entries]
        .sort((a, b) => b.inherentScore - a.inherentScore)
        .slice(0, 5)
        .map((item) => ({
          hazardId: item.hazardId,
          title: item.hazardType,
          score: item.inherentScore,
        })),
      matrix: this.matrix(),
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  identify(
    input: {
      hazardType: string;
      description: string;
      location: string;
      category: HazardCategory;
      likelihood: number;
      severity: number;
      evidenceFileName?: string;
    },
    userId: number,
  ) {
    const now = new Date().toISOString();
    const hazardId = `hz-${this.nextHazard++}`;
    const evidence: RiskEvidence[] = input.evidenceFileName
      ? [
          {
            id: `ev-${this.nextEvidence++}`,
            fileName: input.evidenceFileName,
            uploadedAt: now,
            userId,
          },
        ]
      : [];
    const entry = this.buildEntry(
      {
        hazardType: input.hazardType,
        description: input.description,
        location: input.location,
        category: input.category,
        likelihood: input.likelihood,
        severity: input.severity,
        userId,
      },
      now,
      hazardId,
      this.defaultControls(input.category),
      [],
      evidence,
    );
    this.entries.unshift(entry);
    this.notifyHighRisk(entry);
    return entry;
  }

  score(
    id: string,
    input: { likelihood: number; severity: number },
    userId: number,
  ) {
    const entry = this.getById(id);
    entry.likelihood = clampScale(input.likelihood);
    entry.severity = clampScale(input.severity);
    this.recalculate(entry);
    entry.userId = userId;
    entry.updatedAt = new Date().toISOString();
    this.notifyHighRisk(entry);
    return entry;
  }

  addControl(
    id: string,
    input: {
      type: ControlType;
      name: string;
      description?: string;
      implemented?: boolean;
    },
    userId: number,
  ) {
    const entry = this.getById(id);
    entry.controls.unshift({
      id: `ctl-${this.nextControl++}`,
      type: input.type,
      name: input.name,
      description: input.description ?? '',
      implemented: input.implemented ?? false,
    });
    this.recalculate(entry);
    entry.userId = userId;
    entry.updatedAt = new Date().toISOString();
    return entry;
  }

  toggleControl(id: string, controlId: string, userId: number) {
    const entry = this.getById(id);
    const control = entry.controls.find((item) => item.id === controlId);
    if (!control) throw new NotFoundException(`Control ${controlId} not found`);
    control.implemented = !control.implemented;
    this.recalculate(entry);
    entry.userId = userId;
    entry.updatedAt = new Date().toISOString();
    return entry;
  }

  addAction(
    id: string,
    input: {
      name: string;
      responsiblePerson: string;
      dueDate: string;
    },
    userId: number,
  ) {
    const entry = this.getById(id);
    entry.correctiveActions.unshift({
      id: `act-${this.nextAction++}`,
      name: input.name,
      responsiblePerson: input.responsiblePerson,
      dueDate: input.dueDate,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
    entry.userId = userId;
    entry.updatedAt = new Date().toISOString();
    return entry;
  }

  completeAction(id: string, actionId: string, userId: number) {
    const entry = this.getById(id);
    const action = entry.correctiveActions.find((item) => item.id === actionId);
    if (!action) throw new NotFoundException(`Action ${actionId} not found`);
    action.status = 'done';
    entry.userId = userId;
    entry.updatedAt = new Date().toISOString();
    this.recalculate(entry);
    return entry;
  }

  private buildEntry(
    input: {
      hazardType: string;
      description: string;
      location: string;
      category: HazardCategory;
      likelihood: number;
      severity: number;
      userId: number;
    },
    timestamp: string,
    hazardId: string,
    controls: RiskControl[],
    correctiveActions: RiskCorrectiveAction[],
    evidence: RiskEvidence[] = [],
  ): RiskEntry {
    const likelihood = clampScale(input.likelihood);
    const severity = clampScale(input.severity);
    const inherentScore = likelihood * severity;
    const entry: RiskEntry = {
      id: `risk-${hazardId}`,
      hazardId,
      hazardType: input.hazardType,
      description: input.description,
      location: input.location,
      category: input.category,
      likelihood,
      severity,
      inherentScore,
      residualScore: inherentScore,
      band: scoreBand(inherentScore),
      residualBand: scoreBand(inherentScore),
      controls,
      correctiveActions,
      evidence,
      reductionPercent: 0,
      timestamp,
      userId: input.userId,
      updatedAt: timestamp,
    };
    this.recalculate(entry);
    return entry;
  }

  private recalculate(entry: RiskEntry) {
    entry.inherentScore = entry.likelihood * entry.severity;
    entry.band = scoreBand(entry.inherentScore);
    const implemented = entry.controls.filter((item) => item.implemented).length;
    const total = entry.controls.length;
    const controlFactor = total === 0 ? 0 : implemented / total;
    const actionBoost =
      entry.correctiveActions.filter((item) => item.status === 'done').length * 0.05;
    const reduction = Math.min(0.7, controlFactor * 0.55 + actionBoost);
    entry.residualScore = Math.max(
      1,
      Math.round(entry.inherentScore * (1 - reduction)),
    );
    entry.residualBand = scoreBand(entry.residualScore);
    entry.reductionPercent = Math.round(reduction * 100);
  }

  private defaultControls(category: HazardCategory): RiskControl[] {
    const base: RiskControl[] = [
      {
        id: `ctl-${this.nextControl++}`,
        type: 'engineering',
        name: 'Engineering control',
        description: `Engineered barrier for ${category} hazard.`,
        implemented: false,
      },
      {
        id: `ctl-${this.nextControl++}`,
        type: 'administrative',
        name: 'Administrative control',
        description: 'Procedure, permit, or training gate.',
        implemented: false,
      },
      {
        id: `ctl-${this.nextControl++}`,
        type: 'ppe',
        name: 'PPE control',
        description: 'Last line of defense PPE requirement.',
        implemented: false,
      },
    ];
    return base;
  }

  private notifyHighRisk(entry: RiskEntry) {
    if (entry.band !== 'high' && entry.band !== 'critical') return;
    this.notifications.enqueue({
      category: 'compliance',
      title: 'HIGH RISK HAZARD',
      message: `${entry.hazardType} scored ${entry.inherentScore} (${entry.band}) at ${entry.location}.`,
      forgeStatus: 'failed',
    });
  }
}

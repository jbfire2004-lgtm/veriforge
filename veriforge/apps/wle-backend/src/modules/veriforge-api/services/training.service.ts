import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { VeriForgeStoreService } from './veriforge-store.service';

export type TrainingAssignmentTarget = 'user' | 'role' | 'department';
export type TrainingAssignmentStatus =
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'failed';

export type TrainingModuleRecord = {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  materialName: string | null;
  materialFormat: string | null;
  contentSections: string[];
  quiz: Array<{
    id: string;
    prompt: string;
    options: string[];
    correctIndex: number;
  }>;
  passScore: number;
  forgeStatus: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type TrainingAssignmentRecord = {
  id: string;
  moduleId: string;
  targetType: TrainingAssignmentTarget;
  targetId: string;
  targetLabel: string;
  userId: number;
  status: TrainingAssignmentStatus;
  progress: number;
  score: number | null;
  dueAt: string;
  startedAt: string | null;
  completedAt: string | null;
  timestamp: string;
  updatedAt: string;
};

export type TrainingCertificate = {
  id: string;
  userId: number;
  userName: string;
  moduleId: string;
  moduleTitle: string;
  score: number;
  timestamp: string;
  forgeStatus: 'verified';
};

export type TrainingAnalytics = {
  totalModules: number;
  totalAssignments: number;
  completionRate: number;
  averageScore: number;
  overdueModules: number;
  inProgress: number;
  completed: number;
  timestamp: string;
  userId: number | null;
};

@Injectable()
export class TrainingService {
  private nextModuleId = 104;
  private nextAssignmentId = 1;
  private nextCertificateId = 1;

  private modulesStore: TrainingModuleRecord[] = [
    {
      id: 'm-101',
      title: 'Lockout-Tagout',
      description: 'Control hazardous energy during maintenance operations.',
      category: 'safety',
      durationMinutes: 45,
      materialName: 'loto-guide.pdf',
      materialFormat: 'pdf',
      contentSections: [
        'Identify energy sources',
        'Apply lockout devices',
        'Verify zero energy state',
        'Restore equipment safely',
      ],
      quiz: [
        {
          id: 'q1',
          prompt: 'What must be verified before maintenance begins?',
          options: ['Zero energy state', 'Shift schedule', 'Tool inventory'],
          correctIndex: 0,
        },
        {
          id: 'q2',
          prompt: 'Who may remove a lockout device?',
          options: [
            'Any supervisor',
            'The worker who applied it',
            'Any contractor',
          ],
          correctIndex: 1,
        },
      ],
      passScore: 80,
      forgeStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm-102',
      title: 'High-Heat Response',
      description: 'Respond to thermal incidents in forge environments.',
      category: 'emergency',
      durationMinutes: 30,
      materialName: 'heat-response.pdf',
      materialFormat: 'pdf',
      contentSections: [
        'Recognize heat stress indicators',
        'Activate cooling protocols',
        'Evacuate and report',
      ],
      quiz: [
        {
          id: 'q1',
          prompt: 'First action for heat stress?',
          options: ['Continue work', 'Move to cool zone', 'Increase pace'],
          correctIndex: 1,
        },
      ],
      passScore: 80,
      forgeStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'm-103',
      title: 'Heavy Lift Safety',
      description: 'Safe lifting practices for industrial loads.',
      category: 'operations',
      durationMinutes: 40,
      materialName: 'lift-safety.pdf',
      materialFormat: 'pdf',
      contentSections: [
        'Assess load and path',
        'Use approved lifting gear',
        'Communicate lift signals',
      ],
      quiz: [
        {
          id: 'q1',
          prompt: 'Before a heavy lift, confirm:',
          options: ['Load path clear', 'Break schedule', 'Uniform color'],
          correctIndex: 0,
        },
      ],
      passScore: 75,
      forgeStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private assignments: TrainingAssignmentRecord[] = [];
  private certificates: TrainingCertificate[] = [];

  constructor(
    private readonly store: VeriForgeStoreService,
    private readonly notifications: NotificationService,
  ) {
    // Keep legacy store modules aligned for assistant/other consumers.
    this.syncStoreModules();
  }

  modules() {
    return [...this.modulesStore];
  }

  moduleById(id: string) {
    const module = this.modulesStore.find((item) => item.id === id);
    if (!module) throw new NotFoundException(`Training module ${id} not found`);
    return module;
  }

  createModule(
    input: {
      title: string;
      description: string;
      category: string;
      durationMinutes: number;
      materialName?: string;
      materialFormat?: string;
      contentSections?: string[];
    },
    userId: number,
  ) {
    const now = new Date().toISOString();
    const module: TrainingModuleRecord = {
      id: `m-${this.nextModuleId++}`,
      title: input.title,
      description: input.description,
      category: input.category,
      durationMinutes: input.durationMinutes,
      materialName: input.materialName ?? null,
      materialFormat: input.materialFormat ?? null,
      contentSections:
        input.contentSections && input.contentSections.length > 0
          ? input.contentSections
          : ['Introduction', 'Core procedure', 'Validation'],
      quiz: [
        {
          id: 'q1',
          prompt: `Primary objective of ${input.title}?`,
          options: [
            'Operational safety',
            'Schedule compression',
            'Cost reduction only',
          ],
          correctIndex: 0,
        },
        {
          id: 'q2',
          prompt: 'When is training considered complete?',
          options: [
            'After viewing slides',
            'After passing score',
            'After login',
          ],
          correctIndex: 1,
        },
      ],
      passScore: 80,
      forgeStatus: 'active',
      createdAt: now,
      updatedAt: now,
    };
    this.modulesStore.unshift(module);
    this.syncStoreModules();
    return {
      ...module,
      metadata: { timestamp: now, userId, moduleId: module.id, progress: 0 },
    };
  }

  assign(input: {
    moduleId: string;
    userId: number;
    targetType?: TrainingAssignmentTarget;
    targetId?: string;
    targetLabel?: string;
    dueAt?: string;
  }) {
    const module = this.moduleById(input.moduleId);
    const now = new Date().toISOString();
    const dueAt =
      input.dueAt ??
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const assignment: TrainingAssignmentRecord = {
      id: `assign-${this.nextAssignmentId++}`,
      moduleId: module.id,
      targetType: input.targetType ?? 'user',
      targetId: input.targetId ?? String(input.userId),
      targetLabel: input.targetLabel ?? `User ${input.userId}`,
      userId: input.userId,
      status: 'assigned',
      progress: 0,
      score: null,
      dueAt,
      startedAt: null,
      completedAt: null,
      timestamp: now,
      updatedAt: now,
    };
    this.assignments.unshift(assignment);
    this.emitOverdueAlerts();
    return {
      ...assignment,
      forgeStatus: 'forged' as const,
      metadata: {
        timestamp: now,
        userId: input.userId,
        moduleId: module.id,
        progress: 0,
      },
    };
  }

  listAssignments() {
    this.refreshOverdue();
    return [...this.assignments];
  }

  startDelivery(assignmentId: string, userId: number) {
    const assignment = this.getAssignment(assignmentId);
    assignment.status = 'in_progress';
    assignment.startedAt = assignment.startedAt ?? new Date().toISOString();
    assignment.progress = Math.max(assignment.progress, 10);
    assignment.updatedAt = new Date().toISOString();
    return {
      assignment,
      module: this.moduleById(assignment.moduleId),
      metadata: {
        timestamp: assignment.updatedAt,
        userId,
        moduleId: assignment.moduleId,
        progress: assignment.progress,
      },
    };
  }

  updateProgress(
    assignmentId: string,
    input: { progress: number; sectionIndex?: number },
    userId: number,
  ) {
    const assignment = this.getAssignment(assignmentId);
    assignment.progress = Math.max(
      0,
      Math.min(100, Math.round(input.progress)),
    );
    assignment.status =
      assignment.progress >= 100 ? 'completed' : 'in_progress';
    if (!assignment.startedAt) assignment.startedAt = new Date().toISOString();
    if (assignment.progress >= 100) {
      assignment.completedAt = new Date().toISOString();
    }
    assignment.updatedAt = new Date().toISOString();
    this.refreshOverdue();
    return {
      ...assignment,
      metadata: {
        timestamp: assignment.updatedAt,
        userId,
        moduleId: assignment.moduleId,
        progress: assignment.progress,
        sectionIndex: input.sectionIndex ?? null,
      },
    };
  }

  submitScore(
    assignmentId: string,
    input: { answers: number[] },
    userId: number,
  ) {
    const assignment = this.getAssignment(assignmentId);
    const module = this.moduleById(assignment.moduleId);
    let correct = 0;
    module.quiz.forEach((question, index) => {
      if (input.answers[index] === question.correctIndex) correct += 1;
    });
    const score =
      module.quiz.length === 0
        ? 100
        : Math.round((correct / module.quiz.length) * 100);
    assignment.score = score;
    assignment.progress = 100;
    assignment.updatedAt = new Date().toISOString();
    const passed = score >= module.passScore;
    assignment.status = passed ? 'completed' : 'failed';
    assignment.completedAt = passed ? new Date().toISOString() : null;

    let certificate: TrainingCertificate | null = null;
    if (passed) {
      certificate = {
        id: `cert-${this.nextCertificateId++}`,
        userId,
        userName: assignment.targetLabel,
        moduleId: module.id,
        moduleTitle: module.title,
        score,
        timestamp: new Date().toISOString(),
        forgeStatus: 'verified',
      };
      this.certificates.unshift(certificate);
    }

    return {
      assignment,
      score,
      passed,
      passScore: module.passScore,
      certificate,
      metadata: {
        timestamp: assignment.updatedAt,
        userId,
        moduleId: module.id,
        progress: assignment.progress,
      },
    };
  }

  listCertificates() {
    return [...this.certificates];
  }

  progress(userId: number) {
    this.refreshOverdue();
    const mine = this.assignments.filter((item) => item.userId === userId);
    const completed = mine.filter((item) => item.status === 'completed').length;
    const inProgress = mine.filter(
      (item) => item.status === 'in_progress',
    ).length;
    const overdue = mine.filter((item) => item.status === 'overdue').length;
    const scores = mine
      .map((item) => item.score)
      .filter((score): score is number => typeof score === 'number');
    const averageScore =
      scores.length === 0
        ? 0
        : Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length,
          );

    return {
      userId,
      completed,
      inProgress,
      overdue,
      total: Math.max(mine.length, this.modulesStore.length),
      averageScore,
      forgeStatus: 'verified' as const,
      timestamp: new Date().toISOString(),
      moduleId: null,
      progress:
        mine.length === 0
          ? 0
          : Math.round(
              mine.reduce((sum, item) => sum + item.progress, 0) / mine.length,
            ),
    };
  }

  analytics(userId: number | null = null): TrainingAnalytics {
    this.refreshOverdue();
    const totalAssignments = this.assignments.length;
    const completed = this.assignments.filter(
      (item) => item.status === 'completed',
    ).length;
    const overdueModules = this.assignments.filter(
      (item) => item.status === 'overdue',
    ).length;
    const inProgress = this.assignments.filter(
      (item) => item.status === 'in_progress',
    ).length;
    const scores = this.assignments
      .map((item) => item.score)
      .filter((score): score is number => typeof score === 'number');
    const averageScore =
      scores.length === 0
        ? 0
        : Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length,
          );

    return {
      totalModules: this.modulesStore.length,
      totalAssignments,
      completionRate:
        totalAssignments === 0
          ? 0
          : Math.round((completed / totalAssignments) * 100),
      averageScore,
      overdueModules,
      inProgress,
      completed,
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  private getAssignment(assignmentId: string) {
    const assignment = this.assignments.find(
      (item) => item.id === assignmentId,
    );
    if (!assignment) {
      throw new NotFoundException(`Assignment ${assignmentId} not found`);
    }
    return assignment;
  }

  private refreshOverdue() {
    const now = Date.now();
    for (const assignment of this.assignments) {
      if (
        assignment.status !== 'completed' &&
        new Date(assignment.dueAt).getTime() < now
      ) {
        assignment.status = 'overdue';
      }
    }
  }

  private emitOverdueAlerts() {
    this.refreshOverdue();
    const overdue = this.assignments.filter(
      (item) => item.status === 'overdue',
    );
    for (const assignment of overdue) {
      this.notifications.enqueue({
        title: 'TRAINING OVERDUE',
        message: `Module ${assignment.moduleId} is overdue for ${assignment.targetLabel}.`,
        category: 'training',
        forgeStatus: 'failed',
      });
    }
  }

  private syncStoreModules() {
    this.store.trainingModules = this.modulesStore.map((item) => ({
      id: item.id,
      title: item.title,
      forgeStatus:
        item.forgeStatus === 'active'
          ? ('active' as const)
          : ('inactive' as const),
    }));
  }
}

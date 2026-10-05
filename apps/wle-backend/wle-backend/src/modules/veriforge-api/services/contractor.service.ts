import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TrainingService } from './training.service';
import { VerificationService } from './verification.service';

export type ContractorRole =
  | 'welder'
  | 'electrician'
  | 'rigger'
  | 'safety'
  | 'general';

export type DocumentStatus = 'valid' | 'missing' | 'expired' | 'pending';
export type ForgeCheckStatus = 'Pass' | 'Fail' | 'Pending';

export type ContractorDocument = {
  id: string;
  type: 'certification' | 'license' | 'safety_training';
  name: string;
  status: DocumentStatus;
  expiresAt: string | null;
  uploadedAt: string | null;
};

export type ContractorTraining = {
  moduleId: string;
  title: string;
  progress: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
};

export type ContractorRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  companyName: string;
  role: ContractorRole;
  certifications: string[];
  documents: ContractorDocument[];
  training: ContractorTraining[];
  forgeStatus: ForgeCheckStatus;
  complianceScore: number;
  performanceScore: number;
  incidentCount: number;
  timestamp: string;
  userId: number;
  updatedAt: string;
};

export type ContractorAnalytics = {
  totalContractors: number;
  compliantCount: number;
  nonCompliantCount: number;
  averageCompliance: number;
  averagePerformance: number;
  expiredDocuments: number;
  pendingChecks: number;
  timestamp: string;
  userId: number | null;
};

const ROLE_MODULES: Record<ContractorRole, Array<{ moduleId: string; title: string }>> = {
  welder: [
    { moduleId: 'm-101', title: 'Lockout-Tagout' },
    { moduleId: 'm-102', title: 'High-Heat Response' },
  ],
  electrician: [
    { moduleId: 'm-101', title: 'Lockout-Tagout' },
    { moduleId: 'm-103', title: 'Heavy Lift Safety' },
  ],
  rigger: [{ moduleId: 'm-103', title: 'Heavy Lift Safety' }],
  safety: [
    { moduleId: 'm-101', title: 'Lockout-Tagout' },
    { moduleId: 'm-102', title: 'High-Heat Response' },
    { moduleId: 'm-103', title: 'Heavy Lift Safety' },
  ],
  general: [{ moduleId: 'm-101', title: 'Lockout-Tagout' }],
};

@Injectable()
export class ContractorService {
  private nextId = 3;
  private nextDocId = 1;

  private contractors: ContractorRecord[] = [
    {
      id: 'ctr-1',
      firstName: 'Kane',
      lastName: 'Voss',
      email: 'kane.voss@alloyworks.io',
      companyId: 'co-alloy',
      companyName: 'Alloy Works',
      role: 'welder',
      certifications: ['AWS D1.1', 'Hot Work Permit'],
      documents: [
        {
          id: 'cdoc-1',
          type: 'certification',
          name: 'AWS D1.1',
          status: 'valid',
          expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          uploadedAt: new Date().toISOString(),
        },
        {
          id: 'cdoc-2',
          type: 'license',
          name: 'Trade License',
          status: 'expired',
          expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          uploadedAt: new Date().toISOString(),
        },
        {
          id: 'cdoc-3',
          type: 'safety_training',
          name: 'Site Orientation',
          status: 'missing',
          expiresAt: null,
          uploadedAt: null,
        },
      ],
      training: [
        {
          moduleId: 'm-101',
          title: 'Lockout-Tagout',
          progress: 100,
          status: 'completed',
        },
        {
          moduleId: 'm-102',
          title: 'High-Heat Response',
          progress: 40,
          status: 'in_progress',
        },
      ],
      forgeStatus: 'Pending',
      complianceScore: 62,
      performanceScore: 71,
      incidentCount: 1,
      timestamp: new Date().toISOString(),
      userId: 1,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ctr-2',
      firstName: 'Nora',
      lastName: 'Quill',
      email: 'nora.quill@steelpath.io',
      companyId: 'co-steelpath',
      companyName: 'SteelPath Contractors',
      role: 'electrician',
      certifications: ['Electrical Journeyman'],
      documents: [
        {
          id: 'cdoc-4',
          type: 'certification',
          name: 'Electrical Journeyman',
          status: 'valid',
          expiresAt: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
          uploadedAt: new Date().toISOString(),
        },
        {
          id: 'cdoc-5',
          type: 'license',
          name: 'Trade License',
          status: 'valid',
          expiresAt: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
          uploadedAt: new Date().toISOString(),
        },
        {
          id: 'cdoc-6',
          type: 'safety_training',
          name: 'Site Orientation',
          status: 'valid',
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          uploadedAt: new Date().toISOString(),
        },
      ],
      training: [
        {
          moduleId: 'm-101',
          title: 'Lockout-Tagout',
          progress: 100,
          status: 'completed',
        },
        {
          moduleId: 'm-103',
          title: 'Heavy Lift Safety',
          progress: 100,
          status: 'completed',
        },
      ],
      forgeStatus: 'Pass',
      complianceScore: 94,
      performanceScore: 91,
      incidentCount: 0,
      timestamp: new Date().toISOString(),
      userId: 1,
      updatedAt: new Date().toISOString(),
    },
  ];

  constructor(
    private readonly notifications: NotificationService,
    private readonly training: TrainingService,
    private readonly verification: VerificationService,
  ) {
    this.refreshAllScores();
    this.emitExpiryAlerts();
  }

  list() {
    this.refreshAllScores();
    return [...this.contractors];
  }

  getById(id: string) {
    const contractor = this.contractors.find((item) => item.id === id);
    if (!contractor) throw new NotFoundException(`Contractor ${id} not found`);
    return contractor;
  }

  onboard(
    input: {
      firstName: string;
      lastName: string;
      email: string;
      companyId: string;
      companyName: string;
      role: ContractorRole;
      certifications?: string[];
      documentName?: string;
      documentType?: 'certification' | 'license' | 'safety_training';
      expiresAt?: string | null;
    },
    userId: number,
  ) {
    const now = new Date().toISOString();
    const documents: ContractorDocument[] = [
      {
        id: `cdoc-${this.nextDocId++}`,
        type: 'certification',
        name: 'Primary Certification',
        status: 'missing',
        expiresAt: null,
        uploadedAt: null,
      },
      {
        id: `cdoc-${this.nextDocId++}`,
        type: 'license',
        name: 'Trade License',
        status: 'missing',
        expiresAt: null,
        uploadedAt: null,
      },
      {
        id: `cdoc-${this.nextDocId++}`,
        type: 'safety_training',
        name: 'Site Orientation',
        status: 'missing',
        expiresAt: null,
        uploadedAt: null,
      },
    ];

    if (input.documentName && input.documentType) {
      documents.unshift({
        id: `cdoc-${this.nextDocId++}`,
        type: input.documentType,
        name: input.documentName,
        status: this.documentStatus(input.expiresAt ?? null),
        expiresAt: input.expiresAt ?? null,
        uploadedAt: now,
      });
    }

    const training = ROLE_MODULES[input.role].map((module) => ({
      moduleId: module.moduleId,
      title: module.title,
      progress: 0,
      status: 'assigned' as const,
    }));

    const contractor: ContractorRecord = {
      id: `ctr-${this.nextId++}`,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      companyId: input.companyId,
      companyName: input.companyName,
      role: input.role,
      certifications: input.certifications ?? [],
      documents,
      training,
      forgeStatus: 'Pending',
      complianceScore: 0,
      performanceScore: 0,
      incidentCount: 0,
      timestamp: now,
      userId,
      updatedAt: now,
    };

    this.recalculate(contractor);
    this.contractors.unshift(contractor);
    this.emitExpiryAlerts();
    return contractor;
  }

  uploadDocument(
    contractorId: string,
    input: {
      type: 'certification' | 'license' | 'safety_training';
      name: string;
      expiresAt?: string | null;
    },
    userId: number,
  ) {
    const contractor = this.getById(contractorId);
    const doc: ContractorDocument = {
      id: `cdoc-${this.nextDocId++}`,
      type: input.type,
      name: input.name,
      status: this.documentStatus(input.expiresAt ?? null),
      expiresAt: input.expiresAt ?? null,
      uploadedAt: new Date().toISOString(),
    };
    contractor.documents.unshift(doc);
    contractor.userId = userId;
    contractor.updatedAt = new Date().toISOString();
    this.recalculate(contractor);
    this.emitExpiryAlerts();
    return { contractor, document: doc };
  }

  assignTraining(contractorId: string, userId: number) {
    const contractor = this.getById(contractorId);
    const modules = ROLE_MODULES[contractor.role];
    for (const module of modules) {
      const existing = contractor.training.find(
        (item) => item.moduleId === module.moduleId,
      );
      if (!existing) {
        contractor.training.push({
          moduleId: module.moduleId,
          title: module.title,
          progress: 0,
          status: 'assigned',
        });
      }
      this.training.assign({
        moduleId: module.moduleId,
        userId,
        targetType: 'user',
        targetId: contractor.id,
        targetLabel: `${contractor.firstName} ${contractor.lastName}`,
      });
    }
    contractor.userId = userId;
    contractor.updatedAt = new Date().toISOString();
    this.recalculate(contractor);
    return contractor;
  }

  runForgeCheck(contractorId: string, userId: number) {
    const contractor = this.getById(contractorId);
    const run = this.verification.forgeCheck({
      targetId: contractor.id,
      checkType: 'contractor-onboarding',
      userId,
    });

    const hasExpired = contractor.documents.some(
      (item) => item.status === 'expired' || item.status === 'missing',
    );
    contractor.forgeStatus = hasExpired ? 'Fail' : 'Pass';
    if (contractor.forgeStatus === 'Fail') {
      this.notifications.enqueue({
        title: 'CONTRACTOR FORGECHECK FAILED',
        message: `${contractor.firstName} ${contractor.lastName} failed verification checks.`,
        category: 'verification',
        forgeStatus: 'failed',
      });
    }
    contractor.userId = userId;
    contractor.updatedAt = new Date().toISOString();
    this.recalculate(contractor);
    return { contractor, run };
  }

  updateTrainingProgress(
    contractorId: string,
    moduleId: string,
    progress: number,
    userId: number,
  ) {
    const contractor = this.getById(contractorId);
    const training = contractor.training.find((item) => item.moduleId === moduleId);
    if (!training) {
      throw new NotFoundException(`Training module ${moduleId} not found on contractor`);
    }
    training.progress = Math.max(0, Math.min(100, Math.round(progress)));
    training.status =
      training.progress >= 100
        ? 'completed'
        : training.progress > 0
          ? 'in_progress'
          : 'assigned';
    contractor.userId = userId;
    contractor.updatedAt = new Date().toISOString();
    this.recalculate(contractor);
    return contractor;
  }

  analytics(userId: number | null = null): ContractorAnalytics {
    this.refreshAllScores();
    const total = this.contractors.length;
    const compliantCount = this.contractors.filter(
      (item) => item.complianceScore >= 80 && item.forgeStatus === 'Pass',
    ).length;
    const expiredDocuments = this.contractors.reduce(
      (sum, item) =>
        sum + item.documents.filter((doc) => doc.status === 'expired').length,
      0,
    );
    const pendingChecks = this.contractors.filter(
      (item) => item.forgeStatus === 'Pending',
    ).length;
    const averageCompliance =
      total === 0
        ? 0
        : Math.round(
            this.contractors.reduce((sum, item) => sum + item.complianceScore, 0) /
              total,
          );
    const averagePerformance =
      total === 0
        ? 0
        : Math.round(
            this.contractors.reduce((sum, item) => sum + item.performanceScore, 0) /
              total,
          );

    return {
      totalContractors: total,
      compliantCount,
      nonCompliantCount: total - compliantCount,
      averageCompliance,
      averagePerformance,
      expiredDocuments,
      pendingChecks,
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  private documentStatus(expiresAt: string | null): DocumentStatus {
    if (!expiresAt) return 'pending';
    const expires = new Date(expiresAt).getTime();
    if (Number.isNaN(expires)) return 'pending';
    if (expires < Date.now()) return 'expired';
    return 'valid';
  }

  private recalculate(contractor: ContractorRecord) {
    for (const doc of contractor.documents) {
      if (doc.expiresAt) doc.status = this.documentStatus(doc.expiresAt);
    }

    const docs = contractor.documents;
    const validDocs = docs.filter((item) => item.status === 'valid').length;
    const docScore = docs.length === 0 ? 0 : Math.round((validDocs / docs.length) * 100);

    const training = contractor.training;
    const trainingScore =
      training.length === 0
        ? 0
        : Math.round(
            training.reduce((sum, item) => sum + item.progress, 0) / training.length,
          );

    const verificationScore =
      contractor.forgeStatus === 'Pass'
        ? 100
        : contractor.forgeStatus === 'Pending'
          ? 50
          : 0;

    const complianceScore = Math.round(
      docScore * 0.45 + trainingScore * 0.35 + verificationScore * 0.2,
    );
    contractor.complianceScore = complianceScore;

    const incidentPenalty = Math.min(contractor.incidentCount * 8, 40);
    contractor.performanceScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          complianceScore * 0.7 +
            trainingScore * 0.2 +
            verificationScore * 0.1 -
            incidentPenalty,
        ),
      ),
    );
  }

  private refreshAllScores() {
    for (const contractor of this.contractors) {
      this.recalculate(contractor);
    }
  }

  private emitExpiryAlerts() {
    for (const contractor of this.contractors) {
      const expired = contractor.documents.filter((item) => item.status === 'expired');
      for (const doc of expired) {
        this.notifications.enqueue({
          title: 'CONTRACTOR DOCUMENT EXPIRED',
          message: `${doc.name} expired for ${contractor.firstName} ${contractor.lastName} (${contractor.companyName}).`,
          category: 'compliance',
          forgeStatus: 'failed',
        });
      }
    }
  }
}

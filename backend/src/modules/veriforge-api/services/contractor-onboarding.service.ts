import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationService } from './notification.service';

export type OnboardingRole =
  | 'welder'
  | 'electrician'
  | 'rigger'
  | 'safety'
  | 'general';

export type DocKind =
  | 'certification'
  | 'license'
  | 'insurance'
  | 'training_record';

export type DocStatus = 'valid' | 'missing' | 'expired' | 'pending';
export type TrainingStatus = 'assigned' | 'in_progress' | 'completed' | 'overdue';
export type ForgeCheckStatus = 'Pass' | 'Fail' | 'Pending';
export type AccessDecision = 'allow' | 'deny';
export type OnboardingStage =
  | 'identity'
  | 'company'
  | 'documents'
  | 'training'
  | 'verification'
  | 'compliance'
  | 'badge'
  | 'access'
  | 'complete';

export type OnboardingCompany = {
  id: string;
  companyId: string;
  name: string;
  address: string;
  safetyOfficer: string;
  industry: string;
  missingComplianceDocs: boolean;
  timestamp: string;
  userId: number;
};

export type OnboardingDocument = {
  id: string;
  companyId: string;
  contractorId: string | null;
  kind: DocKind;
  name: string;
  status: DocStatus;
  expiresAt: string | null;
  timestamp: string;
  userId: number;
};

export type OnboardingTraining = {
  id: string;
  companyId: string;
  contractorId: string;
  moduleId: string;
  title: string;
  progress: number;
  status: TrainingStatus;
  timestamp: string;
  userId: number;
};

export type OnboardingBadge = {
  id: string;
  companyId: string;
  contractorId: string;
  qrPayload: string;
  trainingStatus: string;
  verificationStatus: ForgeCheckStatus;
  issuedAt: string;
  timestamp: string;
  userId: number;
};

export type OnboardingRecord = {
  id: string;
  companyId: string;
  name: string;
  role: OnboardingRole;
  companyName: string;
  contact: string;
  certifications: string[];
  forgeStatus: ForgeCheckStatus;
  complianceScore: number;
  trainingScore: number;
  onboardingScore: number;
  completionPercent: number;
  stage: OnboardingStage;
  access: AccessDecision;
  accessReason: string;
  badgeId: string | null;
  startedAt: string;
  completedAt: string | null;
  onboardingHours: number;
  timestamp: string;
  userId: number;
};

export type OnboardingAnalytics = {
  totalOnboardings: number;
  inProgress: number;
  completed: number;
  averageOnboardingHours: number;
  averageOnboardingScore: number;
  complianceGaps: number;
  verificationPassRate: number;
  accessAllowed: number;
  accessDenied: number;
  overdueTraining: number;
  expiredDocuments: number;
  timestamp: string;
  userId: number | null;
};

const ROLE_MODULES: Record<
  OnboardingRole,
  Array<{ moduleId: string; title: string }>
> = {
  welder: [
    { moduleId: 'm-101', title: 'Lockout-Tagout' },
    { moduleId: 'm-102', title: 'High-Heat Response' },
    { moduleId: 'm-104', title: 'Hot Work Controls' },
  ],
  electrician: [
    { moduleId: 'm-101', title: 'Lockout-Tagout' },
    { moduleId: 'm-105', title: 'Electrical Safety' },
    { moduleId: 'm-103', title: 'Heavy Lift Safety' },
  ],
  rigger: [
    { moduleId: 'm-103', title: 'Heavy Lift Safety' },
    { moduleId: 'm-106', title: 'Rigging Fundamentals' },
  ],
  safety: [
    { moduleId: 'm-101', title: 'Lockout-Tagout' },
    { moduleId: 'm-102', title: 'High-Heat Response' },
    { moduleId: 'm-103', title: 'Heavy Lift Safety' },
    { moduleId: 'm-107', title: 'Site Safety Leadership' },
  ],
  general: [
    { moduleId: 'm-101', title: 'Lockout-Tagout' },
    { moduleId: 'm-108', title: 'Site Orientation' },
  ],
};

const REQUIRED_DOCS: Array<{ kind: DocKind; name: string }> = [
  { kind: 'certification', name: 'Trade Certification' },
  { kind: 'license', name: 'Trade License' },
  { kind: 'insurance', name: 'Liability Insurance' },
  { kind: 'training_record', name: 'Prior Training Record' },
];

@Injectable()
export class ContractorOnboardingService {
  private companySeq = 3;
  private contractorSeq = 3;
  private docSeq = 10;
  private trainSeq = 10;
  private badgeSeq = 3;

  private companies: OnboardingCompany[] = [];
  private contractors: OnboardingRecord[] = [];
  private documents: OnboardingDocument[] = [];
  private training: OnboardingTraining[] = [];
  private badges: OnboardingBadge[] = [];

  constructor(private readonly notifications: NotificationService) {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    this.companies = [
      {
        id: 'co-1',
        companyId: 'co-1',
        name: 'Alloy Works',
        address: '1200 Forge Ave',
        safetyOfficer: 'R. Hale',
        industry: 'Fabrication',
        missingComplianceDocs: false,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'co-2',
        companyId: 'co-2',
        name: 'VoltLine Services',
        address: '88 Current Rd',
        safetyOfficer: 'T. Ng',
        industry: 'Electrical',
        missingComplianceDocs: true,
        timestamp: now,
        userId: 1,
      },
    ];

    this.contractors = [
      {
        id: 'ob-1',
        companyId: 'co-1',
        name: 'Kane Voss',
        role: 'welder',
        companyName: 'Alloy Works',
        contact: 'kane.voss@alloyworks.io',
        certifications: ['AWS D1.1', 'Hot Work'],
        forgeStatus: 'Pending',
        complianceScore: 62,
        trainingScore: 40,
        onboardingScore: 55,
        completionPercent: 58,
        stage: 'training',
        access: 'deny',
        accessReason: 'Training incomplete · Verification pending',
        badgeId: null,
        startedAt: now,
        completedAt: null,
        onboardingHours: 6,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ob-2',
        companyId: 'co-2',
        name: 'Lina Ortiz',
        role: 'electrician',
        companyName: 'VoltLine Services',
        contact: 'lina.ortiz@voltline.io',
        certifications: ['Journeyman Electrician'],
        forgeStatus: 'Fail',
        complianceScore: 38,
        trainingScore: 25,
        onboardingScore: 34,
        completionPercent: 42,
        stage: 'documents',
        access: 'deny',
        accessReason: 'Compliance gaps · Failed forgeCheck',
        badgeId: null,
        startedAt: now,
        completedAt: null,
        onboardingHours: 12,
        timestamp: now,
        userId: 1,
      },
    ];

    this.documents = [
      {
        id: 'od-1',
        companyId: 'co-1',
        contractorId: 'ob-1',
        kind: 'certification',
        name: 'Trade Certification',
        status: 'valid',
        expiresAt: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
        timestamp: now,
        userId: 1,
      },
      {
        id: 'od-2',
        companyId: 'co-1',
        contractorId: 'ob-1',
        kind: 'license',
        name: 'Trade License',
        status: 'valid',
        expiresAt: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
        timestamp: now,
        userId: 1,
      },
      {
        id: 'od-3',
        companyId: 'co-1',
        contractorId: 'ob-1',
        kind: 'insurance',
        name: 'Liability Insurance',
        status: 'pending',
        expiresAt: null,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'od-4',
        companyId: 'co-1',
        contractorId: 'ob-1',
        kind: 'training_record',
        name: 'Prior Training Record',
        status: 'missing',
        expiresAt: null,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'od-5',
        companyId: 'co-2',
        contractorId: 'ob-2',
        kind: 'certification',
        name: 'Trade Certification',
        status: 'expired',
        expiresAt: new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10),
        timestamp: now,
        userId: 1,
      },
      {
        id: 'od-6',
        companyId: 'co-2',
        contractorId: 'ob-2',
        kind: 'license',
        name: 'Trade License',
        status: 'missing',
        expiresAt: null,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'od-7',
        companyId: 'co-2',
        contractorId: 'ob-2',
        kind: 'insurance',
        name: 'Liability Insurance',
        status: 'missing',
        expiresAt: null,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'od-8',
        companyId: 'co-2',
        contractorId: 'ob-2',
        kind: 'training_record',
        name: 'Prior Training Record',
        status: 'pending',
        expiresAt: null,
        timestamp: now,
        userId: 1,
      },
      {
        id: 'od-9',
        companyId: 'co-2',
        contractorId: null,
        kind: 'insurance',
        name: 'Company COI',
        status: 'missing',
        expiresAt: null,
        timestamp: now,
        userId: 1,
      },
    ];

    this.training = [
      {
        id: 'ot-1',
        companyId: 'co-1',
        contractorId: 'ob-1',
        moduleId: 'm-101',
        title: 'Lockout-Tagout',
        progress: 100,
        status: 'completed',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ot-2',
        companyId: 'co-1',
        contractorId: 'ob-1',
        moduleId: 'm-102',
        title: 'High-Heat Response',
        progress: 40,
        status: 'in_progress',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ot-3',
        companyId: 'co-1',
        contractorId: 'ob-1',
        moduleId: 'm-104',
        title: 'Hot Work Controls',
        progress: 0,
        status: 'overdue',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ot-4',
        companyId: 'co-2',
        contractorId: 'ob-2',
        moduleId: 'm-101',
        title: 'Lockout-Tagout',
        progress: 20,
        status: 'overdue',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ot-5',
        companyId: 'co-2',
        contractorId: 'ob-2',
        moduleId: 'm-105',
        title: 'Electrical Safety',
        progress: 0,
        status: 'assigned',
        timestamp: now,
        userId: 1,
      },
      {
        id: 'ot-6',
        companyId: 'co-2',
        contractorId: 'ob-2',
        moduleId: 'm-103',
        title: 'Heavy Lift Safety',
        progress: 0,
        status: 'assigned',
        timestamp: now,
        userId: 1,
      },
    ];

    for (const c of this.contractors) {
      this.recompute(c.id);
    }
    this.notifyGaps();
  }

  overview() {
    return {
      companies: this.companies,
      contractors: this.contractors,
      documents: this.documents,
      training: this.training,
      badges: this.badges,
      analytics: this.analytics(),
    };
  }

  analytics(userId: number | null = null): OnboardingAnalytics {
    const completed = this.contractors.filter((c) => c.stage === 'complete');
    const passed = this.contractors.filter((c) => c.forgeStatus === 'Pass').length;
    const gaps = this.documents.filter(
      (d) => d.status === 'missing' || d.status === 'expired',
    ).length;
    return {
      totalOnboardings: this.contractors.length,
      inProgress: this.contractors.filter((c) => c.stage !== 'complete').length,
      completed: completed.length,
      averageOnboardingHours:
        this.contractors.length === 0
          ? 0
          : Math.round(
              (this.contractors.reduce((s, c) => s + c.onboardingHours, 0) /
                this.contractors.length) *
                10,
            ) / 10,
      averageOnboardingScore:
        this.contractors.length === 0
          ? 0
          : Math.round(
              this.contractors.reduce((s, c) => s + c.onboardingScore, 0) /
                this.contractors.length,
            ),
      complianceGaps: gaps,
      verificationPassRate:
        this.contractors.length === 0
          ? 0
          : Math.round((passed / this.contractors.length) * 100),
      accessAllowed: this.contractors.filter((c) => c.access === 'allow').length,
      accessDenied: this.contractors.filter((c) => c.access === 'deny').length,
      overdueTraining: this.training.filter((t) => t.status === 'overdue').length,
      expiredDocuments: this.documents.filter((d) => d.status === 'expired').length,
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  private getCompany(companyId: string) {
    const company = this.companies.find(
      (c) => c.id === companyId || c.companyId === companyId,
    );
    if (!company) throw new NotFoundException(`Company ${companyId} not found`);
    return company;
  }

  private getContractor(id: string) {
    const row = this.contractors.find((c) => c.id === id);
    if (!row) throw new NotFoundException(`Onboarding ${id} not found`);
    return row;
  }

  registerCompany(
    input: {
      name: string;
      address: string;
      safetyOfficer: string;
      industry: string;
    },
    userId: number,
  ) {
    const id = `co-${this.companySeq++}`;
    const company: OnboardingCompany = {
      id,
      companyId: id,
      name: input.name,
      address: input.address,
      safetyOfficer: input.safetyOfficer,
      industry: input.industry,
      missingComplianceDocs: true,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.companies.unshift(company);
    this.documents.unshift({
      id: `od-${this.docSeq++}`,
      companyId: id,
      contractorId: null,
      kind: 'insurance',
      name: 'Company COI',
      status: 'missing',
      expiresAt: null,
      timestamp: new Date().toISOString(),
      userId,
    });
    this.notifyGaps();
    return company;
  }

  captureIdentity(
    input: {
      name: string;
      role: OnboardingRole;
      companyId: string;
      contact: string;
      certifications?: string[];
    },
    userId: number,
  ) {
    const company = this.getCompany(input.companyId);
    const id = `ob-${this.contractorSeq++}`;
    const now = new Date().toISOString();
    const record: OnboardingRecord = {
      id,
      companyId: company.companyId,
      name: input.name,
      role: input.role,
      companyName: company.name,
      contact: input.contact,
      certifications: input.certifications ?? [],
      forgeStatus: 'Pending',
      complianceScore: 0,
      trainingScore: 0,
      onboardingScore: 0,
      completionPercent: 10,
      stage: 'documents',
      access: 'deny',
      accessReason: 'Onboarding incomplete',
      badgeId: null,
      startedAt: now,
      completedAt: null,
      onboardingHours: 0,
      timestamp: now,
      userId,
    };
    this.contractors.unshift(record);

    for (const req of REQUIRED_DOCS) {
      this.documents.unshift({
        id: `od-${this.docSeq++}`,
        companyId: company.companyId,
        contractorId: id,
        kind: req.kind,
        name: req.name,
        status: 'missing',
        expiresAt: null,
        timestamp: now,
        userId,
      });
    }

    for (const mod of ROLE_MODULES[input.role]) {
      this.training.unshift({
        id: `ot-${this.trainSeq++}`,
        companyId: company.companyId,
        contractorId: id,
        moduleId: mod.moduleId,
        title: mod.title,
        progress: 0,
        status: 'assigned',
        timestamp: now,
        userId,
      });
    }

    this.recompute(id);
    this.notifyGaps();
    return this.getContractor(id);
  }

  upsertDocument(
    input: {
      companyId: string;
      contractorId?: string | null;
      kind: DocKind;
      name: string;
      status: DocStatus;
      expiresAt?: string | null;
    },
    userId: number,
  ) {
    this.getCompany(input.companyId);
    const expired =
      input.expiresAt && new Date(input.expiresAt).getTime() < Date.now();
    const doc: OnboardingDocument = {
      id: `od-${this.docSeq++}`,
      companyId: input.companyId,
      contractorId: input.contractorId ?? null,
      kind: input.kind,
      name: input.name,
      status: expired ? 'expired' : input.status,
      expiresAt: input.expiresAt ?? null,
      timestamp: new Date().toISOString(),
      userId,
    };
    this.documents.unshift(doc);
    this.refreshCompanyDocs(input.companyId);
    if (input.contractorId) this.recompute(input.contractorId);
    this.notifyGaps();
    return doc;
  }

  setDocumentStatus(
    docId: string,
    status: DocStatus,
    expiresAt: string | null,
    userId: number,
  ) {
    const doc = this.documents.find((d) => d.id === docId);
    if (!doc) throw new NotFoundException(`Document ${docId} not found`);
    const expired =
      expiresAt && new Date(expiresAt).getTime() < Date.now()
        ? true
        : status === 'expired';
    doc.status = expired ? 'expired' : status;
    doc.expiresAt = expiresAt;
    doc.userId = userId;
    doc.timestamp = new Date().toISOString();
    this.refreshCompanyDocs(doc.companyId);
    if (doc.contractorId) this.recompute(doc.contractorId);
    this.notifyGaps();
    return doc;
  }

  bumpTraining(trainingId: string, delta: number, userId: number) {
    const row = this.training.find((t) => t.id === trainingId);
    if (!row) throw new NotFoundException(`Training ${trainingId} not found`);
    row.progress = Math.max(0, Math.min(100, row.progress + delta));
    row.status =
      row.progress >= 100
        ? 'completed'
        : row.progress > 0
          ? 'in_progress'
          : row.status === 'overdue'
            ? 'overdue'
            : 'assigned';
    row.userId = userId;
    row.timestamp = new Date().toISOString();
    this.recompute(row.contractorId);
    return row;
  }

  runForgeCheck(contractorId: string, userId: number) {
    const record = this.getContractor(contractorId);
    const docs = this.documents.filter((d) => d.contractorId === contractorId);
    const train = this.training.filter((t) => t.contractorId === contractorId);
    const docOk = docs.every((d) => d.status === 'valid');
    const trainOk = train.every((t) => t.status === 'completed');
    record.forgeStatus = docOk && trainOk ? 'Pass' : docs.some((d) => d.status === 'expired') || train.some((t) => t.status === 'overdue') ? 'Fail' : 'Pending';
    record.userId = userId;
    record.timestamp = new Date().toISOString();
    if (record.forgeStatus === 'Fail') {
      this.notifications.enqueue({
        title: 'FORGECHECK FAILED',
        message: `${record.name} failed verification checks.`,
        category: 'compliance',
        forgeStatus: 'failed',
      });
    }
    this.recompute(contractorId);
    return this.getContractor(contractorId);
  }

  generateBadge(contractorId: string, userId: number) {
    const record = this.getContractor(contractorId);
    this.recompute(contractorId);
    if (record.access !== 'allow' && record.forgeStatus !== 'Pass') {
      record.stage = 'badge';
    }
    const badge: OnboardingBadge = {
      id: `bdg-${this.badgeSeq++}`,
      companyId: record.companyId,
      contractorId: record.id,
      qrPayload: `VF|${record.id}|${record.companyId}|${Date.now()}`,
      trainingStatus:
        record.trainingScore >= 100 ? 'complete' : `${record.trainingScore}%`,
      verificationStatus: record.forgeStatus,
      issuedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      userId,
    };
    this.badges.unshift(badge);
    record.badgeId = badge.id;
    record.userId = userId;
    record.timestamp = new Date().toISOString();
    this.recompute(contractorId);
    return { badge, record: this.getContractor(contractorId) };
  }

  evaluateAccess(contractorId: string, userId: number) {
    this.recompute(contractorId);
    const record = this.getContractor(contractorId);
    record.userId = userId;
    record.timestamp = new Date().toISOString();
    return record;
  }

  private refreshCompanyDocs(companyId: string) {
    const company = this.companies.find((c) => c.companyId === companyId);
    if (!company) return;
    const companyDocs = this.documents.filter(
      (d) => d.companyId === companyId && d.contractorId === null,
    );
    company.missingComplianceDocs = companyDocs.some(
      (d) => d.status === 'missing' || d.status === 'expired',
    );
    company.timestamp = new Date().toISOString();
  }

  private recompute(contractorId: string) {
    const record = this.getContractor(contractorId);
    const docs = this.documents.filter((d) => d.contractorId === contractorId);
    const train = this.training.filter((t) => t.contractorId === contractorId);

    const validDocs = docs.filter((d) => d.status === 'valid').length;
    const complianceScore =
      docs.length === 0 ? 0 : Math.round((validDocs / docs.length) * 100);

    const trainScore =
      train.length === 0
        ? 0
        : Math.round(
            train.reduce((s, t) => s + t.progress, 0) / train.length,
          );

    const verifyScore =
      record.forgeStatus === 'Pass' ? 100 : record.forgeStatus === 'Fail' ? 0 : 40;

    const hasBadge = Boolean(record.badgeId);
    const completionPercent = Math.round(
      (docs.length > 0 ? 20 : 0) +
        (validDocs === docs.length && docs.length > 0 ? 15 : validDocs > 0 ? 8 : 0) +
        (train.length > 0 ? 15 : 0) +
        (trainScore >= 100 ? 15 : Math.round(trainScore * 0.1)) +
        (record.forgeStatus !== 'Pending' ? 10 : 0) +
        (record.forgeStatus === 'Pass' ? 10 : 0) +
        (hasBadge ? 10 : 0) +
        (record.access === 'allow' ? 5 : 0),
    );

    const gaps = docs.filter(
      (d) => d.status === 'missing' || d.status === 'expired',
    ).length;
    const overdue = train.filter((t) => t.status === 'overdue').length;

    const accessAllow =
      complianceScore >= 80 &&
      trainScore >= 100 &&
      record.forgeStatus === 'Pass' &&
      gaps === 0 &&
      overdue === 0;

    const reasons: string[] = [];
    if (complianceScore < 80 || gaps > 0) reasons.push('Compliance gaps');
    if (trainScore < 100 || overdue > 0) reasons.push('Training incomplete');
    if (record.forgeStatus !== 'Pass') reasons.push('Verification not passed');

    record.complianceScore = complianceScore;
    record.trainingScore = trainScore;
    record.onboardingScore = Math.round(
      complianceScore * 0.35 + trainScore * 0.35 + verifyScore * 0.3,
    );
    record.completionPercent = Math.max(0, Math.min(100, completionPercent));
    record.access = accessAllow ? 'allow' : 'deny';
    record.accessReason = accessAllow
      ? 'Training, verification, and compliance cleared'
      : reasons.join(' · ') || 'Onboarding incomplete';
    record.onboardingHours = Math.max(
      1,
      Math.round(
        (Date.now() - new Date(record.startedAt).getTime()) / 3600000,
      ) || record.onboardingHours || 1,
    );

    if (accessAllow && hasBadge) {
      record.stage = 'complete';
      record.completedAt = record.completedAt ?? new Date().toISOString();
    } else if (hasBadge) {
      record.stage = 'access';
    } else if (record.forgeStatus === 'Pass') {
      record.stage = 'badge';
    } else if (trainScore >= 50) {
      record.stage = 'verification';
    } else if (validDocs > 0) {
      record.stage = 'training';
    } else {
      record.stage = 'documents';
    }

    record.timestamp = new Date().toISOString();
  }

  private notifyGaps() {
    const criticalDocs = this.documents.filter(
      (d) => d.status === 'missing' || d.status === 'expired',
    );
    if (criticalDocs.length === 0) return;
    const latest = criticalDocs[0];
    this.notifications.enqueue({
      title: 'CRITICAL COMPLIANCE GAP',
      message: `${latest.name} is ${latest.status} (companyId: ${latest.companyId}).`,
      category: 'compliance',
      forgeStatus: 'failed',
    });
  }
}

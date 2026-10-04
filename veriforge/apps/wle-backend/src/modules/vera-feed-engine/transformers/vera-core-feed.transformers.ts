import { FeedSource } from '@prisma/client';
import type { VeraCoreFeedUpsertInput } from './vera-core-feed.types';

type TrainingRecordRow = {
  id: number;
  workerId: number;
  companyId: number | null;
  projectId: number | null;
  completedAt: Date | null;
  issuedAt: Date;
  expiresAt: Date | null;
  certificateNumber: string | null;
  certificationId: number;
  worker: { firstName: string; lastName: string; companyId: number | null };
  certification: { name: string };
};

type EquipmentRow = {
  id: number;
  name: string;
  companyId: number | null;
  safetyStatus: string;
  lockedOutAt: Date | null;
  lockoutReason: string | null;
  updatedAt: Date;
};

type ProjectRow = {
  id: number;
  name: string;
  companyId: number;
  status: string;
  updatedAt?: Date;
};

type ValidationRow = {
  id: number;
  outcome: string;
  score: number | null;
  validatedAt: Date;
  trainingRecordId: number | null;
  trainingRecord: {
    id: number;
    workerId: number;
    companyId: number | null;
    worker: { firstName: string; lastName: string };
    certification: { name: string };
  } | null;
};

export function trainingCompletionToFeed(
  record: TrainingRecordRow,
): VeraCoreFeedUpsertInput {
  const name = `${record.worker.firstName} ${record.worker.lastName}`;
  return {
    source: FeedSource.VERA_CORE_TRAINING,
    externalId: `training-${record.id}`,
    title: `${name} completed ${record.certification.name}`,
    summary: record.certificateNumber
      ? `Certificate #${record.certificateNumber}`
      : 'Training marked complete in Vera Core',
    publishedAt: record.completedAt ?? record.issuedAt,
    companyId: record.companyId ?? record.worker.companyId ?? undefined,
    workerId: record.workerId,
    projectId: record.projectId ?? undefined,
    url: `/training-records/${record.id}`,
    metadata: {
      certificationId: record.certificationId,
      eventType: 'training.completed',
    },
    rankScore: 1.1,
  };
}

export function workerAchievementToFeed(
  record: TrainingRecordRow,
): VeraCoreFeedUpsertInput {
  const name = `${record.worker.firstName} ${record.worker.lastName}`;
  return {
    source: FeedSource.WORKER_ACHIEVEMENT,
    externalId: `achievement-${record.id}`,
    title: `${name} earned ${record.certification.name}`,
    summary: 'Training milestone achieved',
    publishedAt: record.completedAt ?? record.issuedAt,
    companyId: record.companyId ?? record.worker.companyId ?? undefined,
    workerId: record.workerId,
    projectId: record.projectId ?? undefined,
    url: `/workers/${record.workerId}/wallet`,
    metadata: { certificationId: record.certificationId },
    rankScore: 0.95,
  };
}

export function trainingExpiryToFeed(
  record: TrainingRecordRow,
  now = new Date(),
): VeraCoreFeedUpsertInput | null {
  if (!record.expiresAt) return null;
  const msLeft = record.expiresAt.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
  const expired = daysLeft < 0;
  const daysAbs = Math.abs(daysLeft);
  const horizonDays = 30;
  if (!expired && daysLeft > horizonDays) return null;

  const urgency = expired ? 3 : daysLeft <= 7 ? 3 : daysLeft <= 14 ? 2 : 1;
  const name = `${record.worker.firstName} ${record.worker.lastName}`;

  return {
    source: FeedSource.TRAINING_EXPIRY,
    externalId: `expiry-${record.id}`,
    title: expired
      ? `${record.certification.name} expired`
      : `${record.certification.name} expires in ${daysLeft} day${
          daysLeft === 1 ? '' : 's'
        }`,
    summary: expired
      ? `${name} — expired ${record.expiresAt.toLocaleDateString()}`
      : `${name} — renew before ${record.expiresAt.toLocaleDateString()}`,
    publishedAt: now,
    companyId: record.companyId ?? record.worker.companyId ?? undefined,
    workerId: record.workerId,
    projectId: record.projectId ?? undefined,
    url: `/training-records/${record.id}`,
    safetyPriority: urgency,
    metadata: {
      trainingRecordId: record.id,
      daysLeft,
      expired,
      eventType: 'training.expiring',
    },
    rankScore: 1 + urgency * 0.1,
  };
}

export function projectAssignedToFeed(
  project: ProjectRow,
  workerName?: string,
): VeraCoreFeedUpsertInput {
  return {
    source: FeedSource.VERA_CORE_PROJECT,
    externalId: `project-assigned-${project.id}`,
    title: workerName
      ? `${workerName} assigned to ${project.name}`
      : `Project update: ${project.name}`,
    summary: 'New project assignment in Vera Core',
    publishedAt: new Date(),
    companyId: project.companyId,
    projectId: project.id,
    url: `/projects/${project.id}`,
    metadata: { eventType: 'project.assigned', projectStatus: project.status },
    rankScore: 1.05,
  };
}

export function projectClosedToFeed(
  project: ProjectRow,
): VeraCoreFeedUpsertInput {
  return {
    source: FeedSource.VERA_CORE_PROJECT,
    externalId: `project-closed-${project.id}`,
    title: `Project closed: ${project.name}`,
    summary: `Status: ${project.status}`,
    publishedAt: new Date(),
    companyId: project.companyId,
    projectId: project.id,
    url: `/projects/${project.id}`,
    metadata: { eventType: 'project.closed', projectStatus: project.status },
    rankScore: 0.9,
  };
}

export function dailyLogToFeed(log: {
  id: number;
  title: string;
  body: string | null;
  logDate: Date;
  companyId: number | null;
}): VeraCoreFeedUpsertInput {
  return {
    source: FeedSource.VERA_CORE_PROJECT,
    externalId: `daily-log-${log.id}`,
    title: log.title,
    summary: log.body?.slice(0, 200) ?? 'Project daily log update',
    publishedAt: log.logDate,
    companyId: log.companyId ?? undefined,
    url: `/core/daily-logs/${log.id}`,
    metadata: { eventType: 'project.daily_log' },
    rankScore: 0.9,
  };
}

export function equipmentStatusToFeed(
  equipment: EquipmentRow,
): VeraCoreFeedUpsertInput | null {
  const locked = equipment.lockedOutAt != null;
  const needsAttention = locked || equipment.safetyStatus !== 'OK';
  if (!needsAttention) return null;

  return {
    source: FeedSource.VERA_CORE_EQUIPMENT,
    externalId: `equipment-${equipment.id}`,
    title: locked
      ? `${equipment.name} is locked out`
      : `${equipment.name} needs attention`,
    summary: equipment.lockoutReason ?? `Status: ${equipment.safetyStatus}`,
    publishedAt: equipment.updatedAt,
    companyId: equipment.companyId ?? undefined,
    url: `/equipment/${equipment.id}`,
    metadata: {
      safetyStatus: equipment.safetyStatus,
      locked,
      eventType: locked ? 'equipment.lockout' : 'equipment.status',
    },
    rankScore: locked ? 1.2 : 1,
  };
}

export function workerVerificationToFeed(
  validation: ValidationRow,
): VeraCoreFeedUpsertInput | null {
  const record = validation.trainingRecord;
  if (!record) return null;

  const name = `${record.worker.firstName} ${record.worker.lastName}`;
  const outcomeLabel =
    validation.outcome === 'APPROVED'
      ? 'verified'
      : validation.outcome === 'REJECTED'
      ? 'rejected'
      : validation.outcome === 'NEEDS_REVIEW'
      ? 'needs review'
      : 'pending review';

  return {
    source: FeedSource.WORKER_VERIFICATION,
    externalId: `verification-${validation.id}`,
    title: `${name}: ${record.certification.name} ${outcomeLabel}`,
    summary:
      validation.score != null
        ? `Validation score ${validation.score}%`
        : `Training validation ${outcomeLabel}`,
    publishedAt: validation.validatedAt,
    companyId: record.companyId ?? undefined,
    workerId: record.workerId,
    url: `/training-records/${record.id}`,
    metadata: {
      validationResultId: validation.id,
      outcome: validation.outcome,
      eventType: 'worker.verification',
    },
    rankScore: validation.outcome === 'REJECTED' ? 1.15 : 1,
    safetyPriority: validation.outcome === 'REJECTED' ? 2 : 0,
  };
}

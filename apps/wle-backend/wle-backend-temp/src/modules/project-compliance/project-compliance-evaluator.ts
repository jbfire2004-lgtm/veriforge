import type { ProjectComplianceRuleType } from '@prisma/client';
import {
  EXPIRING_SOON_DAYS,
  type ComplianceCredentialStatus,
  type ComplianceRuleGap,
  type RuleMetadata,
  type WorkerComplianceEvaluation,
} from './project-compliance.types';

export type EvaluatorRule = {
  id: number;
  ruleType: ProjectComplianceRuleType;
  requiredCredentialTypeId: number;
  certificationCode: string | null;
  certificationName: string;
  metadata: RuleMetadata;
};

export type EvaluatorCredential = {
  id: number;
  certificationId: number;
  expiresAt: Date | null;
  lastVerificationStatus: string | null;
};

export type EvaluatorWorker = {
  id: number;
  firstName: string;
  lastName: string;
  role: string | null;
  trade: string | null;
};

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

function metadataList(
  metadata: RuleMetadata,
  key: 'roles' | 'trades',
): string[] {
  const raw = metadata[key];
  if (!Array.isArray(raw)) return [];
  return raw.map((v) => normalizeToken(String(v))).filter(Boolean);
}

export function ruleAppliesToWorker(
  rule: EvaluatorRule,
  worker: Pick<EvaluatorWorker, 'role' | 'trade'>,
): boolean {
  switch (rule.ruleType) {
    case 'ALL_WORKERS':
      return true;
    case 'ROLE': {
      const roles = metadataList(rule.metadata, 'roles');
      if (!roles.length) return false;
      const workerRole = normalizeToken(worker.role ?? '');
      return roles.some(
        (r) => workerRole.includes(r) || r.includes(workerRole),
      );
    }
    case 'TRADE': {
      const trades = metadataList(rule.metadata, 'trades');
      if (!trades.length) return false;
      const workerTrade = normalizeToken(worker.trade ?? '');
      return trades.some(
        (t) => workerTrade.includes(t) || t.includes(workerTrade),
      );
    }
    default:
      return false;
  }
}

export function credentialStatus(
  record: EvaluatorCredential | undefined,
  now: Date,
  expiringCutoff: Date,
): ComplianceCredentialStatus {
  if (!record) return 'missing';
  if (record.expiresAt && record.expiresAt <= now) return 'expired';
  if (record.expiresAt && record.expiresAt <= expiringCutoff) {
    return 'expiring_soon';
  }
  return 'valid';
}

function gapReason(
  status: ComplianceCredentialStatus,
  certName: string,
): string {
  switch (status) {
    case 'missing':
      return `Missing required credential: ${certName}`;
    case 'expired':
      return `Expired credential: ${certName}`;
    case 'expiring_soon':
      return `Credential expiring soon: ${certName}`;
    default:
      return `Non-compliant: ${certName}`;
  }
}

export function evaluateWorkerCompliance(
  worker: EvaluatorWorker,
  rules: EvaluatorRule[],
  credentials: EvaluatorCredential[],
  now = new Date(),
): WorkerComplianceEvaluation {
  const expiringCutoff = new Date(
    now.getTime() + EXPIRING_SOON_DAYS * 86_400_000,
  );
  const credByCert = new Map<number, EvaluatorCredential>();
  for (const c of credentials) {
    const existing = credByCert.get(c.certificationId);
    if (!existing) {
      credByCert.set(c.certificationId, c);
      continue;
    }
    const existingStatus = credentialStatus(existing, now, expiringCutoff);
    const nextStatus = credentialStatus(c, now, expiringCutoff);
    if (nextStatus === 'valid' && existingStatus !== 'valid') {
      credByCert.set(c.certificationId, c);
    } else if (
      nextStatus === existingStatus &&
      (c.expiresAt?.getTime() ?? 0) > (existing.expiresAt?.getTime() ?? 0)
    ) {
      credByCert.set(c.certificationId, c);
    }
  }

  const gaps: ComplianceRuleGap[] = [];
  const expiringSoon: ComplianceRuleGap[] = [];

  for (const rule of rules) {
    if (!ruleAppliesToWorker(rule, worker)) continue;
    const record = credByCert.get(rule.requiredCredentialTypeId);
    const status = credentialStatus(record, now, expiringCutoff);
    const gap: ComplianceRuleGap = {
      ruleId: rule.id,
      ruleType: rule.ruleType,
      certificationId: rule.requiredCredentialTypeId,
      certificationCode: rule.certificationCode,
      certificationName: rule.certificationName,
      status,
      credentialId: record?.id ?? null,
      expiresAt: record?.expiresAt?.toISOString() ?? null,
      reason: gapReason(status, rule.certificationName),
    };
    if (status === 'valid') continue;
    if (status === 'expiring_soon') {
      expiringSoon.push(gap);
    } else {
      gaps.push(gap);
    }
  }

  return {
    workerId: worker.id,
    workerName: `${worker.firstName} ${worker.lastName}`.trim(),
    role: worker.role,
    trade: worker.trade,
    isCompliant: gaps.length === 0,
    gaps,
    expiringSoon,
  };
}

export function aggregateProjectCompliance(
  projectId: number,
  projectName: string,
  companyId: number,
  client: string | null,
  workers: WorkerComplianceEvaluation[],
): {
  compliancePercentage: number;
  compliantWorkers: WorkerComplianceEvaluation[];
  nonCompliantWorkers: WorkerComplianceEvaluation[];
  missingOrExpiring: ComplianceRuleGap[];
} {
  const compliantWorkers = workers.filter((w) => w.isCompliant);
  const nonCompliantWorkers = workers.filter((w) => !w.isCompliant);
  const missingOrExpiring = workers.flatMap((w) => [
    ...w.gaps,
    ...w.expiringSoon,
  ]);
  const compliancePercentage =
    workers.length > 0
      ? Math.round((compliantWorkers.length / workers.length) * 100)
      : 100;

  return {
    compliancePercentage,
    compliantWorkers,
    nonCompliantWorkers,
    missingOrExpiring,
  };
}

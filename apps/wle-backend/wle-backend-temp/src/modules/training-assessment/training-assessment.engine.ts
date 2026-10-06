import type {
  CompetencyLevel,
  TaeAssessmentInput,
  TaeAssessmentResult,
  TaeCorrectiveAction,
  TaeRequirementInput,
  TaeRequirementResult,
  TaeRequirementType,
  TaeTrainingRecord,
} from './training-assessment.types';

const LEVEL_RANK: Record<CompetencyLevel, number> = {
  Awareness: 1,
  Operator: 2,
  Supervisor: 3,
  Instructor: 4,
};

const EXPIRING_SOON_MS = 30 * 24 * 60 * 60 * 1000;

const WEIGHTS = {
  validity: 0.4,
  provider: 0.2,
  competency: 0.2,
  evidence: 0.2,
} as const;

function parseDate(iso: string): Date {
  return new Date(iso);
}

function matchesRequirement(
  req: TaeRequirementInput,
  record: TaeTrainingRecord,
): boolean {
  const code = req.code.trim().toUpperCase();
  const rc = record.courseCode.trim().toUpperCase();
  return rc === code;
}

function findMatchingRecords(
  req: TaeRequirementInput,
  records: TaeTrainingRecord[],
): TaeTrainingRecord[] {
  return records.filter((r) => matchesRequirement(req, r));
}

function pickBestRecord(
  records: TaeTrainingRecord[],
  now: Date,
): TaeTrainingRecord | null {
  if (records.length === 0) return null;
  const scored = records.map((r) => {
    let s = 0;
    if (r.expiresAt && parseDate(r.expiresAt) > now) s += 10;
    if (r.verificationStatus === 'Verified') s += 5;
    if (r.evidenceFiles?.length) s += 2;
    if (r.level) s += LEVEL_RANK[r.level];
    return { r, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored[0].r;
}

function evaluateValidity(
  record: TaeTrainingRecord | null,
  now: Date,
): {
  validityStatus: TaeRequirementResult['validityStatus'];
  validityScore: number;
} {
  if (!record?.expiresAt) {
    return { validityStatus: 'NoRecord', validityScore: 0 };
  }
  const exp = parseDate(record.expiresAt);
  if (exp < now) {
    return { validityStatus: 'Expired', validityScore: 0 };
  }
  if (exp.getTime() <= now.getTime() + EXPIRING_SOON_MS) {
    return { validityStatus: 'ExpiringSoon', validityScore: 0.7 };
  }
  return { validityStatus: 'Valid', validityScore: 1 };
}

function evaluateProvider(
  req: TaeRequirementInput,
  record: TaeTrainingRecord | null,
): {
  providerStatus: TaeRequirementResult['providerStatus'];
  providerScore: number;
} {
  if (!record) {
    return { providerStatus: 'NoRecord', providerScore: 0 };
  }
  const approved = req.approvedProviders ?? [];
  if (approved.length === 0) {
    return { providerStatus: 'UnknownButAccepted', providerScore: 0.8 };
  }
  const provider = (record.provider ?? '').trim();
  if (!provider) {
    return { providerStatus: 'Invalid', providerScore: 0 };
  }
  const ok = approved.some(
    (p) => p.trim().toLowerCase() === provider.toLowerCase(),
  );
  return ok
    ? { providerStatus: 'Valid', providerScore: 1 }
    : { providerStatus: 'Invalid', providerScore: 0 };
}

function evaluateCompetency(
  req: TaeRequirementInput,
  record: TaeTrainingRecord | null,
): {
  competencyStatus: TaeRequirementResult['competencyStatus'];
  competencyScore: number;
} {
  if (!record?.level) {
    return { competencyStatus: 'NoRecord', competencyScore: 0 };
  }
  const workerRank = LEVEL_RANK[record.level];
  const requiredRank = LEVEL_RANK[req.minLevel];
  if (workerRank >= requiredRank) {
    return { competencyStatus: 'MeetsOrExceeds', competencyScore: 1 };
  }
  return { competencyStatus: 'Insufficient', competencyScore: 0 };
}

function evaluateEvidence(record: TaeTrainingRecord | null): {
  evidenceStatus: TaeRequirementResult['evidenceStatus'];
  evidenceScore: number;
} {
  if (!record) {
    return { evidenceStatus: 'None', evidenceScore: 0 };
  }
  const hasFiles = (record.evidenceFiles?.length ?? 0) > 0;
  const hasDates = Boolean(record.completedAt && record.expiresAt);
  if (hasFiles && hasDates) {
    return { evidenceStatus: 'Complete', evidenceScore: 1 };
  }
  if (hasFiles || record.completedAt || record.expiresAt) {
    return { evidenceStatus: 'Incomplete', evidenceScore: 0.3 };
  }
  return { evidenceStatus: 'None', evidenceScore: 0 };
}

function requirementScore(
  validityScore: number,
  providerScore: number,
  competencyScore: number,
  evidenceScore: number,
): number {
  const raw =
    WEIGHTS.validity * validityScore +
    WEIGHTS.provider * providerScore +
    WEIGHTS.competency * competencyScore +
    WEIGHTS.evidence * evidenceScore;
  return Math.round(100 * raw);
}

function overallStatusFromScore(
  score: number,
): TaeAssessmentResult['overallStatus'] {
  if (score >= 90) return 'Compliant';
  if (score >= 70) return 'ConditionallyCompliant';
  return 'NonCompliant';
}

function deriveRequirementStatus(
  validityStatus: TaeRequirementResult['validityStatus'],
  providerStatus: TaeRequirementResult['providerStatus'],
  competencyStatus: TaeRequirementResult['competencyStatus'],
  evidenceStatus: TaeRequirementResult['evidenceStatus'],
  verificationRejected: boolean,
): TaeRequirementResult['status'] {
  if (verificationRejected) return 'NotMet';
  if (validityStatus === 'NoRecord' || validityStatus === 'Expired') {
    return 'NotMet';
  }
  if (
    providerStatus === 'Invalid' ||
    competencyStatus === 'Insufficient' ||
    evidenceStatus === 'None'
  ) {
    return 'NotMet';
  }
  if (validityStatus === 'ExpiringSoon') {
    return 'ExpiringSoon';
  }
  if (evidenceStatus === 'Incomplete') {
    return 'NotMet';
  }
  return 'Met';
}

function buildCorrectiveAction(
  req: TaeRequirementInput,
  reqType: TaeRequirementType,
  result: TaeRequirementResult,
  workerId: string,
  index: number,
): TaeCorrectiveAction | null {
  if (result.status === 'Met') return null;

  let type: TaeCorrectiveAction['type'] = 'Training';
  let description = `Complete required training: ${req.name} (${req.code}).`;
  let priority: TaeCorrectiveAction['priority'] = 'High';
  let recommendedDueDays = 14;

  if (
    result.validityStatus === 'NoRecord' ||
    result.validityStatus === 'Expired'
  ) {
    type = 'Training';
    description =
      result.validityStatus === 'Expired'
        ? `Renew expired training: ${req.name} (${req.code}).`
        : `Obtain training: ${req.name} (${req.code}).`;
    priority = 'High';
    recommendedDueDays = result.validityStatus === 'Expired' ? 7 : 14;
  } else if (result.validityStatus === 'ExpiringSoon') {
    type = 'Training';
    description = `Renew training before expiry: ${req.name} (${req.code}).`;
    priority = 'Medium';
    recommendedDueDays = 30;
  } else if (result.providerStatus === 'Invalid') {
    type = 'Provider';
    description = `Re-take ${req.name} (${req.code}) with an approved provider.`;
    priority = 'High';
    recommendedDueDays = 14;
  } else if (result.competencyStatus === 'Insufficient') {
    type = 'Competency';
    description = `Upgrade competency to at least ${req.minLevel} for ${req.name} (${req.code}).`;
    priority = 'High';
    recommendedDueDays = 14;
  } else if (
    result.evidenceStatus === 'Incomplete' ||
    result.evidenceStatus === 'None'
  ) {
    type = 'Evidence';
    description = `Upload complete evidence (certificate with dates) for ${req.name} (${req.code}).`;
    priority = 'Medium';
    recommendedDueDays = 7;
  }

  const blockingForSiteAccess =
    reqType === 'Project' ||
    result.validityStatus === 'NoRecord' ||
    result.validityStatus === 'Expired' ||
    result.providerStatus === 'Invalid' ||
    result.competencyStatus === 'Insufficient';

  return {
    id: `CA-${req.id}-${index}`,
    requirementId: req.id,
    workerId,
    type,
    description,
    priority,
    recommendedDueDays,
    blockingForSiteAccess,
  };
}

function evaluateOneRequirement(
  req: TaeRequirementInput,
  reqType: TaeRequirementType,
  records: TaeTrainingRecord[],
  workerId: string,
  now: Date,
  caIndexStart: number,
): { result: TaeRequirementResult; actions: TaeCorrectiveAction[] } {
  const matches = findMatchingRecords(req, records);
  const best = pickBestRecord(matches, now);
  const mappedIds = matches.map((m) => m.id);

  const { validityStatus, validityScore } = evaluateValidity(best, now);
  const { providerStatus, providerScore } = evaluateProvider(req, best);
  const { competencyStatus, competencyScore } = evaluateCompetency(req, best);
  const { evidenceStatus, evidenceScore } = evaluateEvidence(best);

  const verificationRejected = best?.verificationStatus === 'Rejected';

  const score = requirementScore(
    validityScore,
    providerScore,
    competencyScore,
    evidenceScore,
  );

  const status = deriveRequirementStatus(
    validityStatus,
    providerStatus,
    competencyStatus,
    evidenceStatus,
    verificationRejected,
  );

  const result: TaeRequirementResult = {
    requirementId: req.id,
    requirementType: reqType,
    name: req.name,
    score,
    status,
    validityStatus,
    providerStatus,
    competencyStatus,
    evidenceStatus,
    mappedTrainingRecordIds: mappedIds,
  };

  const action = buildCorrectiveAction(
    req,
    reqType,
    result,
    workerId,
    caIndexStart,
  );

  return { result, actions: action ? [action] : [] };
}

/**
 * Deterministic Training Assessment Engine — evaluates provided input only.
 */
export function evaluateTrainingAssessment(
  input: TaeAssessmentInput,
): TaeAssessmentResult {
  const now = parseDate(input.context.dateNow);
  const workerId = input.worker.id;
  const records = input.trainingRecords.filter((r) => r.workerId === workerId);

  const buckets: Array<{
    type: TaeRequirementType;
    reqs: TaeRequirementInput[];
  }> = [
    { type: 'HiringClient', reqs: input.hiringClientRequirements },
    { type: 'Project', reqs: input.projectRequirements },
    { type: 'Legislative', reqs: input.legislativeRequirements },
  ];

  const requirementResults: TaeRequirementResult[] = [];
  const correctiveActions: TaeCorrectiveAction[] = [];
  let caIndex = 0;

  for (const bucket of buckets) {
    for (const req of bucket.reqs) {
      const { result, actions } = evaluateOneRequirement(
        req,
        bucket.type,
        records,
        workerId,
        now,
        caIndex,
      );
      requirementResults.push(result);
      correctiveActions.push(...actions);
      caIndex += actions.length;
    }
  }

  const overallScore =
    requirementResults.length > 0
      ? Math.round(
          requirementResults.reduce((s, r) => s + r.score, 0) /
            requirementResults.length,
        )
      : 0;

  return {
    workerId,
    overallScore,
    overallStatus: overallStatusFromScore(overallScore),
    requirementResults,
    correctiveActions,
  };
}

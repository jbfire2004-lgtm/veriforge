import type { SpceRequirementResult } from '../safety-program-compliance/safety-program-compliance.types';
import type { TaeAssessmentResult } from '../training-assessment/training-assessment.types';
import type {
  SgaeAssessmentInput,
  SgaeAssessmentResult,
  SgaeCategory,
  SgaeComplianceAssessment,
  SgaeFieldDataSummary,
  SgaeRoadmapItem,
} from './smart-gap-analysis.types';

const CATEGORY_WEIGHTS: Record<SgaeCategory, number> = {
  Policy: 0.25,
  Procedure: 0.25,
  Training: 0.25,
  FieldPractice: 0.15,
  Records: 0.1,
};

const EVIDENCE_LIMITED_SCORE = 60;

const PRIORITY_RANK: Record<string, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

function overallStatusFromGapScore(
  score: number,
): SgaeAssessmentResult['overallStatus'] {
  if (score >= 85) return 'Acceptable';
  if (score >= 70) return 'ConditionallyAcceptable';
  return 'NotAcceptable';
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function policyScoreFromSpce(results: SpceRequirementResult[]): {
  score: number;
  note?: string;
} {
  const scores = results.filter((r) => r.type === 'Policy').map((r) => r.score);
  const avg = average(scores);
  if (avg == null) {
    return { score: EVIDENCE_LIMITED_SCORE, note: 'EvidenceLimited' };
  }
  return { score: avg };
}

function procedureScoreFromSpce(results: SpceRequirementResult[]): {
  score: number;
  note?: string;
} {
  const scores = results
    .filter((r) => r.type === 'Procedure')
    .map((r) => r.score);
  const avg = average(scores);
  if (avg == null) {
    return { score: EVIDENCE_LIMITED_SCORE, note: 'EvidenceLimited' };
  }
  return { score: avg };
}

function recordsScoreFromSpce(
  results: SpceRequirementResult[],
  field?: SgaeFieldDataSummary | null,
): { score: number; note?: string } {
  const scores = results
    .filter((r) => r.type === 'Recordkeeping')
    .map((r) => r.score);
  let base = average(scores);
  if (base == null) {
    base = EVIDENCE_LIMITED_SCORE;
  }
  const overdue = field?.overdueCorrectiveActions ?? 0;
  let adjusted = base;
  if (overdue >= 5) adjusted = Math.max(0, base - 20);
  else if (overdue >= 2) adjusted = Math.max(0, base - 10);

  const note =
    scores.length === 0
      ? 'EvidenceLimited'
      : overdue > 0
      ? `Adjusted down for ${overdue} overdue corrective action(s)`
      : undefined;
  return { score: adjusted, note };
}

function trainingScoreFromTae(taeResults: TaeAssessmentResult[]): {
  score: number;
  note?: string;
} {
  if (taeResults.length === 0) {
    return { score: EVIDENCE_LIMITED_SCORE, note: 'EvidenceLimited' };
  }
  const avg = average(taeResults.map((t) => t.overallScore));
  return { score: avg ?? EVIDENCE_LIMITED_SCORE };
}

function fieldPracticeScoreFromSummary(field?: SgaeFieldDataSummary | null): {
  score: number;
  note?: string;
} {
  if (!field) {
    return { score: EVIDENCE_LIMITED_SCORE, note: 'EvidenceLimited' };
  }

  let score = 100;
  const notes: string[] = [];

  const jha = field.jhaCountLast90Days ?? 0;
  const flha = field.flhaCountLast90Days ?? 0;
  const inspections = field.inspectionCountLast90Days ?? 0;
  const activityTotal = jha + flha + inspections;

  const expected =
    field.expectedJhaPer90Days ??
    (field.workerCount != null ? Math.max(10, field.workerCount * 2) : null);

  if (expected != null && activityTotal < expected * 0.5) {
    score -= 15;
    notes.push('Low proactive field activity vs expected benchmark');
  } else if (activityTotal === 0) {
    score -= 25;
    notes.push('No JHA/FLHA/inspection activity reported');
  }

  const incidents = field.incidentCountLast90Days ?? 0;
  if (incidents >= 5) {
    score -= 20;
    notes.push('Elevated incident rate (90d)');
  } else if (incidents >= 2) {
    score -= 8;
    notes.push('Moderate incident count (90d)');
  }

  const highSev = field.highSeverityIncidentsLast12Months ?? 0;
  if (highSev >= 2) {
    score -= 25;
    notes.push('Multiple high-severity incidents (12mo)');
  } else if (highSev >= 1) {
    score -= 12;
    notes.push('High-severity incident in last 12 months');
  }

  const overdue = field.overdueCorrectiveActions ?? 0;
  if (overdue >= 5) {
    score -= 20;
    notes.push('Many overdue corrective actions');
  } else if (overdue >= 1) {
    score -= 5 * overdue;
    notes.push(`${overdue} overdue corrective action(s)`);
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return {
    score,
    note: notes.length ? notes.join('; ') : undefined,
  };
}

function legislativeCompliance(
  spceResults: SpceRequirementResult[],
  taeResults: TaeAssessmentResult[],
): SgaeComplianceAssessment {
  const spceReferenced = spceResults.filter(
    (r) => r.legislationStatus === 'Referenced',
  ).length;
  const spceNotRef = spceResults.filter(
    (r) => r.legislationStatus === 'NotReferenced',
  ).length;

  const taeLeg = taeResults.flatMap((t) =>
    t.requirementResults.filter((r) => r.requirementType === 'Legislative'),
  );
  const taeMet = taeLeg.filter((r) => r.status === 'Met').length;
  const taeNotMet = taeLeg.filter((r) => r.status === 'NotMet').length;

  let assessment: SgaeComplianceAssessment['assessment'] = 'Moderate';
  if (spceNotRef === 0 && taeNotMet === 0 && spceReferenced + taeMet > 0) {
    assessment = 'Strong';
  } else if (
    spceNotRef + taeNotMet > spceReferenced + taeMet ||
    taeNotMet >= 2
  ) {
    assessment = 'Weak';
  }

  const notes = [
    `SPCE: ${spceReferenced} referenced, ${spceNotRef} not referenced legislative items`,
    `TAE: ${taeMet}/${taeLeg.length} legislative requirements met`,
  ].join('. ');

  return { assessment, notes };
}

function hiringClientCompliance(
  spceOverall: number,
  spceStatus: string,
  taeResults: TaeAssessmentResult[],
): SgaeComplianceAssessment {
  const taeAvg =
    average(taeResults.map((t) => t.overallScore)) ?? EVIDENCE_LIMITED_SCORE;
  const taeNonCompliant = taeResults.filter(
    (t) => t.overallStatus === 'NonCompliant',
  ).length;

  let assessment: SgaeComplianceAssessment['assessment'] = 'Moderate';
  if (spceOverall >= 85 && taeAvg >= 85 && taeNonCompliant === 0) {
    assessment = 'Strong';
  } else if (spceOverall < 70 || taeAvg < 70 || taeNonCompliant > 0) {
    assessment = 'Weak';
  }

  const notes = `SPCE program score ${spceOverall} (${spceStatus}); TAE worker average ${taeAvg} (${taeResults.length} worker(s) assessed).`;
  return { assessment, notes };
}

function mapSpceCategory(type: string): SgaeCategory {
  switch (type) {
    case 'Policy':
      return 'Policy';
    case 'Procedure':
      return 'Procedure';
    case 'Recordkeeping':
      return 'Records';
    case 'Form':
    case 'TrainingConfig':
      return 'Procedure';
    default:
      return 'Policy';
  }
}

function buildRoadmap(input: SgaeAssessmentInput): SgaeRoadmapItem[] {
  const items: SgaeRoadmapItem[] = [];
  let idx = 0;

  for (const ca of input.spceResults.correctiveActions) {
    items.push({
      id: `CAR-SPCE-${idx++}`,
      sourceEngine: 'SPCE',
      category: mapSpceCategory(ca.category),
      description: ca.description,
      priority: ca.priority,
      recommendedDueDays: ca.recommendedDueDays,
      blockingForOnboarding: ca.blockingForPrequalification,
    });
  }

  for (const tae of input.taeResults) {
    for (const ca of tae.correctiveActions) {
      items.push({
        id: `CAR-TAE-${idx++}`,
        sourceEngine: 'TAE',
        category: 'Training',
        description: ca.description,
        priority: ca.priority,
        recommendedDueDays: ca.recommendedDueDays,
        blockingForOnboarding: ca.blockingForSiteAccess,
      });
    }
  }

  items.sort((a, b) => {
    const pr =
      (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
    if (pr !== 0) return pr;
    if (a.blockingForOnboarding === b.blockingForOnboarding) return 0;
    return a.blockingForOnboarding ? -1 : 1;
  });

  return items;
}

/**
 * Smart Gap Analysis Engine — synthesizes SPCE, TAE, and field evidence (deterministic).
 */
export function evaluateSmartGapAnalysis(
  input: SgaeAssessmentInput,
): SgaeAssessmentResult {
  const spceReqs = input.spceResults.requirementResults;

  const policy = policyScoreFromSpce(spceReqs);
  const procedure = procedureScoreFromSpce(spceReqs);
  const training = trainingScoreFromTae(input.taeResults);
  const fieldPractice = fieldPracticeScoreFromSummary(input.fieldDataSummary);
  const records = recordsScoreFromSpce(spceReqs, input.fieldDataSummary);

  const categoryScores = {
    Policy: policy.score,
    Procedure: procedure.score,
    Training: training.score,
    FieldPractice: fieldPractice.score,
    Records: records.score,
  };

  const overallGapScore = Math.round(
    categoryScores.Policy * CATEGORY_WEIGHTS.Policy +
      categoryScores.Procedure * CATEGORY_WEIGHTS.Procedure +
      categoryScores.Training * CATEGORY_WEIGHTS.Training +
      categoryScores.FieldPractice * CATEGORY_WEIGHTS.FieldPractice +
      categoryScores.Records * CATEGORY_WEIGHTS.Records,
  );

  const categoryNotes: SgaeAssessmentResult['categoryNotes'] = {};
  if (policy.note) categoryNotes.Policy = policy.note;
  if (procedure.note) categoryNotes.Procedure = procedure.note;
  if (training.note) categoryNotes.Training = training.note;
  if (fieldPractice.note) categoryNotes.FieldPractice = fieldPractice.note;
  if (records.note) categoryNotes.Records = records.note;

  return {
    companyId: input.company.id,
    hiringClientId: input.hiringClient.id,
    overallGapScore,
    overallStatus: overallStatusFromGapScore(overallGapScore),
    categoryScores,
    categoryNotes,
    legislativeCompliance: legislativeCompliance(spceReqs, input.taeResults),
    hiringClientCompliance: hiringClientCompliance(
      input.spceResults.overallScore,
      input.spceResults.overallStatus,
      input.taeResults,
    ),
    correctiveActionRoadmap: buildRoadmap(input),
  };
}

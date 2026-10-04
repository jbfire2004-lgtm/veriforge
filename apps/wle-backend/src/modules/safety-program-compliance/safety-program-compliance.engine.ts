import type {
  SpceAssessmentInput,
  SpceAssessmentResult,
  SpceCompanySubmission,
  SpceCorrectiveAction,
  SpceDocument,
  SpceProgramRequirement,
  SpceRequirementResult,
  SpceRequirementType,
} from './safety-program-compliance.types';

const THREE_YEARS_MS = 3 * 365.25 * 24 * 60 * 60 * 1000;

const DIM_WEIGHTS = {
  existence: 0.25,
  currency: 0.2,
  structure: 0.25,
  legislation: 0.15,
  alignment: 0.15,
} as const;

function parseDate(iso: string): Date {
  return new Date(iso);
}

function statusFromScore(score: number): SpceRequirementResult['status'] {
  if (score >= 90) return 'Accepted';
  if (score >= 70) return 'ConditionallyAccepted';
  return 'Rejected';
}

function impliesTrainingOrField(type: SpceRequirementType): boolean {
  return type === 'TrainingConfig' || type === 'Form' || type === 'Procedure';
}

function submissionsForRequirement(
  req: SpceProgramRequirement,
  submissions: SpceCompanySubmission[],
): SpceCompanySubmission[] {
  return submissions.filter((s) => s.requirementId === req.id);
}

function latestRevisionDate(docs: SpceDocument[]): Date | null {
  let latest: Date | null = null;
  for (const d of docs) {
    if (!d.revisionDate) continue;
    const dt = parseDate(d.revisionDate);
    if (!latest || dt > latest) latest = dt;
  }
  return latest;
}

function collectParsedSections(submissions: SpceCompanySubmission[]): string[] {
  const set = new Set<string>();
  for (const sub of submissions) {
    for (const doc of sub.documents ?? []) {
      for (const s of doc.parsedSections ?? []) {
        set.add(s.trim());
      }
    }
  }
  return [...set];
}

function legislationReferenced(
  req: SpceProgramRequirement,
  submissions: SpceCompanySubmission[],
): boolean {
  const links = req.linkedLegislation ?? [];
  if (links.length === 0) return false;

  const norm = links.map((l) => l.trim().toUpperCase());
  for (const sub of submissions) {
    for (const doc of sub.documents ?? []) {
      for (const ref of doc.legislationRefs ?? []) {
        if (norm.includes(ref.trim().toUpperCase())) return true;
      }
      const summary = (doc.contentSummary ?? '').toUpperCase();
      for (const code of norm) {
        if (summary.includes(code)) return true;
      }
    }
  }
  return false;
}

function evaluateExistence(submissions: SpceCompanySubmission[]): {
  existenceStatus: SpceRequirementResult['existenceStatus'];
  existenceScore: number;
} {
  const has =
    submissions.length > 0 &&
    submissions.some(
      (s) =>
        (s.documents?.length ?? 0) > 0 ||
        (s.linkedTrainingConfigs?.length ?? 0) > 0 ||
        (s.linkedForms?.length ?? 0) > 0,
    );
  return has
    ? { existenceStatus: 'Present', existenceScore: 1 }
    : { existenceStatus: 'Missing', existenceScore: 0 };
}

function evaluateCurrency(
  req: SpceProgramRequirement,
  submissions: SpceCompanySubmission[],
  now: Date,
): {
  currencyStatus: SpceRequirementResult['currencyStatus'];
  currencyScore: number;
} {
  if (submissions.length === 0) {
    return { currencyStatus: 'NotConfigured', currencyScore: 0 };
  }

  if (req.type === 'Policy' || req.type === 'Procedure') {
    const docs = submissions.flatMap((s) => s.documents ?? []);
    if (docs.length === 0) {
      return { currencyStatus: 'NotConfigured', currencyScore: 0 };
    }
    const rev = latestRevisionDate(docs);
    if (!rev) {
      return { currencyStatus: 'NotConfigured', currencyScore: 0 };
    }
    if (now.getTime() - rev.getTime() > THREE_YEARS_MS) {
      return { currencyStatus: 'Outdated', currencyScore: 0.4 };
    }
    return { currencyStatus: 'Current', currencyScore: 1 };
  }

  if (req.type === 'Form' || req.type === 'TrainingConfig') {
    const hasConfig = submissions.some(
      (s) =>
        (s.linkedForms?.length ?? 0) > 0 ||
        (s.linkedTrainingConfigs?.length ?? 0) > 0 ||
        (s.documents?.length ?? 0) > 0,
    );
    return hasConfig
      ? { currencyStatus: 'Current', currencyScore: 1 }
      : { currencyStatus: 'NotConfigured', currencyScore: 0 };
  }

  const rev = latestRevisionDate(submissions.flatMap((s) => s.documents ?? []));
  if (!rev) {
    return { currencyStatus: 'NotConfigured', currencyScore: 0 };
  }
  if (now.getTime() - rev.getTime() > THREE_YEARS_MS) {
    return { currencyStatus: 'Outdated', currencyScore: 0.4 };
  }
  return { currencyStatus: 'Current', currencyScore: 1 };
}

function evaluateStructure(
  req: SpceProgramRequirement,
  submissions: SpceCompanySubmission[],
): {
  structureStatus: SpceRequirementResult['structureStatus'];
  structureScore: number;
} {
  const required = req.requiredSections ?? [];
  if (required.length === 0) {
    return { structureStatus: 'Complete', structureScore: 1 };
  }

  const parsed = collectParsedSections(submissions);
  if (parsed.length === 0) {
    return { structureStatus: 'Partial', structureScore: 0.5 };
  }

  const parsedNorm = parsed.map((p) => p.toLowerCase());
  const missing = required.filter(
    (r) => !parsedNorm.some((p) => p.includes(r.trim().toLowerCase())),
  );

  if (missing.length === 0) {
    return { structureStatus: 'Complete', structureScore: 1 };
  }
  if (missing.length < required.length) {
    return { structureStatus: 'Partial', structureScore: 0.5 };
  }
  return { structureStatus: 'Missing', structureScore: 0 };
}

function evaluateLegislation(
  req: SpceProgramRequirement,
  submissions: SpceCompanySubmission[],
): {
  legislationStatus: SpceRequirementResult['legislationStatus'];
  legislationScore: number;
} {
  const links = req.linkedLegislation ?? [];
  if (links.length === 0) {
    return { legislationStatus: 'NotApplicable', legislationScore: 1 };
  }
  if (legislationReferenced(req, submissions)) {
    return { legislationStatus: 'Referenced', legislationScore: 1 };
  }
  return { legislationStatus: 'NotReferenced', legislationScore: 0.3 };
}

function evaluateAlignment(
  req: SpceProgramRequirement,
  submissions: SpceCompanySubmission[],
): {
  trainingAlignmentStatus: SpceRequirementResult['trainingAlignmentStatus'];
  fieldAlignmentStatus: SpceRequirementResult['fieldAlignmentStatus'];
  alignmentScore: number;
} {
  const trainingNeeded =
    impliesTrainingOrField(req.type) || req.type === 'Policy';
  const fieldNeeded = impliesTrainingOrField(req.type) || req.type === 'Policy';

  const hasTraining = submissions.some(
    (s) => (s.linkedTrainingConfigs?.length ?? 0) > 0,
  );
  const hasForms = submissions.some((s) => (s.linkedForms?.length ?? 0) > 0);

  const trainingStatus: SpceRequirementResult['trainingAlignmentStatus'] =
    !trainingNeeded ? 'NotConfigured' : hasTraining ? 'Aligned' : 'NotAligned';

  const fieldStatus: SpceRequirementResult['fieldAlignmentStatus'] =
    !fieldNeeded ? 'NotConfigured' : hasForms ? 'Aligned' : 'NotAligned';

  if (!trainingNeeded && !fieldNeeded) {
    return {
      trainingAlignmentStatus: 'NotConfigured',
      fieldAlignmentStatus: 'NotConfigured',
      alignmentScore: 1,
    };
  }

  const trainAligned = trainingStatus === 'Aligned';
  const fieldAligned = fieldStatus === 'Aligned';

  if (trainAligned && fieldAligned) {
    return {
      trainingAlignmentStatus: trainingStatus,
      fieldAlignmentStatus: fieldStatus,
      alignmentScore: 1,
    };
  }
  if (trainAligned || fieldAligned) {
    return {
      trainingAlignmentStatus: trainingStatus,
      fieldAlignmentStatus: fieldStatus,
      alignmentScore: 0.6,
    };
  }

  return {
    trainingAlignmentStatus: trainingStatus,
    fieldAlignmentStatus: fieldStatus,
    alignmentScore: 0,
  };
}

function requirementScore(
  existenceScore: number,
  currencyScore: number,
  structureScore: number,
  legislationScore: number,
  alignmentScore: number,
): number {
  const raw =
    DIM_WEIGHTS.existence * existenceScore +
    DIM_WEIGHTS.currency * currencyScore +
    DIM_WEIGHTS.structure * structureScore +
    DIM_WEIGHTS.legislation * legislationScore +
    DIM_WEIGHTS.alignment * alignmentScore;
  return Math.round(100 * raw);
}

function buildCorrectiveAction(
  req: SpceProgramRequirement,
  result: SpceRequirementResult,
  companyId: string,
  index: number,
): SpceCorrectiveAction | null {
  if (result.score >= 90) return null;

  const priority: SpceCorrectiveAction['priority'] =
    result.score < 70 ? 'High' : 'Medium';
  const recommendedDueDays = result.score < 70 ? 14 : 30;

  const parts: string[] = [];
  if (result.existenceStatus === 'Missing') {
    parts.push(`Provide submission for: ${req.description}`);
  }
  if (result.currencyStatus === 'Outdated') {
    parts.push('Update document revision to within the last 3 years.');
  }
  if (result.currencyStatus === 'NotConfigured') {
    parts.push('Configure and attach required program artifacts.');
  }
  if (
    result.structureStatus === 'Partial' ||
    result.structureStatus === 'Missing'
  ) {
    parts.push(
      `Include required sections: ${
        (req.requiredSections ?? []).join(', ') || 'see requirement'
      }.`,
    );
  }
  if (result.legislationStatus === 'NotReferenced') {
    parts.push(
      `Reference legislation: ${(req.linkedLegislation ?? []).join(', ')}.`,
    );
  }
  if (
    result.trainingAlignmentStatus === 'NotAligned' ||
    result.trainingAlignmentStatus === 'NotConfigured'
  ) {
    parts.push('Link training configuration to this program requirement.');
  }
  if (
    result.fieldAlignmentStatus === 'NotAligned' ||
    result.fieldAlignmentStatus === 'NotConfigured'
  ) {
    parts.push(
      'Link field forms (e.g. inspections) to this program requirement.',
    );
  }

  return {
    id: `CA-${req.id}-${index}`,
    requirementId: req.id,
    companyId,
    category: req.type,
    description: parts.join(' ') || `Improve ${req.category} program element.`,
    priority,
    recommendedDueDays,
    blockingForPrequalification: result.score < 70,
  };
}

function evaluateRequirement(
  req: SpceProgramRequirement,
  submissions: SpceCompanySubmission[],
  companyId: string,
  now: Date,
  caIndex: number,
): { result: SpceRequirementResult; actions: SpceCorrectiveAction[] } {
  const subs = submissionsForRequirement(req, submissions);

  const { existenceStatus, existenceScore } = evaluateExistence(subs);
  const { currencyStatus, currencyScore } = evaluateCurrency(req, subs, now);
  const { structureStatus, structureScore } = evaluateStructure(req, subs);
  const { legislationStatus, legislationScore } = evaluateLegislation(
    req,
    subs,
  );
  const { trainingAlignmentStatus, fieldAlignmentStatus, alignmentScore } =
    evaluateAlignment(req, subs);

  const score = requirementScore(
    existenceScore,
    currencyScore,
    structureScore,
    legislationScore,
    alignmentScore,
  );

  const result: SpceRequirementResult = {
    requirementId: req.id,
    category: req.category,
    type: req.type,
    score,
    status: statusFromScore(score),
    existenceStatus,
    currencyStatus,
    structureStatus,
    legislationStatus,
    trainingAlignmentStatus,
    fieldAlignmentStatus,
    submissionIds: subs.map((s) => s.id),
  };

  const action = buildCorrectiveAction(req, result, companyId, caIndex);
  return { result, actions: action ? [action] : [] };
}

/**
 * Safety Program Compliance Engine (SPCE) — deterministic evaluation of provided input only.
 */
export function evaluateSafetyProgramCompliance(
  input: SpceAssessmentInput,
): SpceAssessmentResult {
  const now = parseDate(input.context.dateNow);
  const companyId =
    input.companySubmissions[0]?.companyId ??
    input.hiringClientProgramRequirements[0]?.id ??
    'unknown';

  const requirementResults: SpceRequirementResult[] = [];
  const correctiveActions: SpceCorrectiveAction[] = [];
  let caIndex = 0;

  for (const req of input.hiringClientProgramRequirements) {
    const { result, actions } = evaluateRequirement(
      req,
      input.companySubmissions,
      companyId,
      now,
      caIndex,
    );
    requirementResults.push(result);
    correctiveActions.push(...actions);
    caIndex += actions.length;
  }

  const totalWeight = input.hiringClientProgramRequirements.reduce(
    (s, r) => s + (r.weight > 0 ? r.weight : 0),
    0,
  );

  const overallScore =
    totalWeight > 0
      ? Math.round(
          requirementResults.reduce((sum, r, i) => {
            const w = input.hiringClientProgramRequirements[i]?.weight ?? 0;
            return sum + r.score * w;
          }, 0) / totalWeight,
        )
      : requirementResults.length > 0
      ? Math.round(
          requirementResults.reduce((s, r) => s + r.score, 0) /
            requirementResults.length,
        )
      : 0;

  return {
    companyId,
    overallScore,
    overallStatus: statusFromScore(overallScore),
    requirementResults,
    correctiveActions,
  };
}

/**
 * Weighted section scoring + overall audit score (0–100).
 */

export type ScoreQuestion = {
  id: string;
  weight: number;
  maxScore: number;
  questionType: 'score' | 'yes_no' | 'text' | 'na';
  required?: boolean;
};

export type ScoreSection = {
  id: string;
  weight: number;
  questions: ScoreQuestion[];
};

export type ScoreAnswer = {
  questionId: string;
  /** 0–maxScore for score type; 0|maxScore for yes_no; ignored if isNa */
  scoreValue?: number | null;
  answerText?: string | null;
  isNa?: boolean;
};

export type SectionScoreResult = {
  sectionId: string;
  weight: number;
  score: number | null;
  answered: number;
  total: number;
  maxContribution: number;
};

export type AuditScoreResult = {
  overallScore: number | null;
  sectionScores: SectionScoreResult[];
  complete: boolean;
  missingQuestionIds: string[];
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function normalizeAnswerScore(
  q: ScoreQuestion,
  a: ScoreAnswer | undefined,
): number | null {
  if (!a || a.isNa) return null;
  if (q.questionType === 'text') {
    // Text questions don't contribute unless a scoreValue is also provided
    if (a.scoreValue == null) return null;
  }
  if (q.questionType === 'yes_no') {
    const raw = a.scoreValue;
    if (raw == null) {
      const t = (a.answerText || '').toLowerCase();
      if (t === 'yes' || t === 'y' || t === 'true') return q.maxScore;
      if (t === 'no' || t === 'n' || t === 'false') return 0;
      return null;
    }
    return clamp(raw, 0, q.maxScore);
  }
  if (a.scoreValue == null || Number.isNaN(a.scoreValue)) return null;
  return clamp(a.scoreValue, 0, q.maxScore);
}

/** Percent 0–100 for a question relative to maxScore. */
function questionPercent(q: ScoreQuestion, value: number): number {
  if (q.maxScore <= 0) return 0;
  return clamp((value / q.maxScore) * 100);
}

export function scoreSection(
  section: ScoreSection,
  answers: ScoreAnswer[],
): SectionScoreResult {
  const byId = new Map(answers.map((a) => [a.questionId, a]));
  let weightSum = 0;
  let weighted = 0;
  let answered = 0;
  let total = 0;

  for (const q of section.questions) {
    if (q.questionType === 'na') continue;
    total += 1;
    const a = byId.get(q.id);
    if (a?.isNa) continue;
    const raw = normalizeAnswerScore(q, a);
    if (raw == null) continue;
    answered += 1;
    const w = Math.max(0, q.weight || 0);
    weightSum += w;
    weighted += questionPercent(q, raw) * w;
  }

  return {
    sectionId: section.id,
    weight: section.weight,
    score: weightSum > 0 ? clamp(weighted / weightSum) : null,
    answered,
    total,
    maxContribution: section.weight,
  };
}

export function scoreAudit(
  sections: ScoreSection[],
  answers: ScoreAnswer[],
): AuditScoreResult {
  const sectionScores = sections.map((s) => scoreSection(s, answers));
  const byId = new Map(answers.map((a) => [a.questionId, a]));

  const missingQuestionIds: string[] = [];
  for (const s of sections) {
    for (const q of s.questions) {
      if (q.questionType === 'na' || !q.required) continue;
      const a = byId.get(q.id);
      if (a?.isNa) continue;
      if (normalizeAnswerScore(q, a) == null && q.questionType !== 'text') {
        missingQuestionIds.push(q.id);
      } else if (
        q.questionType === 'text' &&
        q.required &&
        !(a?.answerText?.trim())
      ) {
        missingQuestionIds.push(q.id);
      }
    }
  }

  let weightSum = 0;
  let weighted = 0;
  for (const ss of sectionScores) {
    if (ss.score == null) continue;
    const w = Math.max(0, ss.weight || 0);
    weightSum += w;
    weighted += ss.score * w;
  }

  return {
    overallScore: weightSum > 0 ? clamp(Math.round(weighted / weightSum)) : null,
    sectionScores,
    complete: missingQuestionIds.length === 0,
    missingQuestionIds,
  };
}

/** Map overall score → directory ContractorAuditResult. */
export function resultFromScore(
  score: number | null,
): 'pass' | 'conditional' | 'fail' | 'pending' {
  if (score == null) return 'pending';
  if (score >= 80) return 'pass';
  if (score >= 60) return 'conditional';
  return 'fail';
}

import type { ExpertQaAnswer } from '@prisma/client';

export type RankableAnswer = Pick<
  ExpertQaAnswer,
  'id' | 'voteScore' | 'isExpertAnswer' | 'createdAt'
> & { isAccepted?: boolean };

const RECENCY_MS = 7 * 24 * 60 * 60 * 1000;

/** Rank answers: accepted > expert boost > votes > recency */
export function computeAnswerRankScore(
  answer: RankableAnswer,
  now: Date = new Date(),
): number {
  const ageMs = Math.max(0, now.getTime() - answer.createdAt.getTime());
  const recency = Math.exp(-ageMs / RECENCY_MS);
  const expertBoost = answer.isExpertAnswer ? 1.25 : 1;
  const acceptedBoost = answer.isAccepted ? 3 : 1;
  return answer.voteScore * expertBoost * acceptedBoost * recency * 100;
}

export function sortAnswersByRank<T extends RankableAnswer>(
  answers: T[],
  acceptedId?: string | null,
  now: Date = new Date(),
): T[] {
  return [...answers].sort(
    (a, b) =>
      computeAnswerRankScore({ ...b, isAccepted: b.id === acceptedId }, now) -
        computeAnswerRankScore(
          { ...a, isAccepted: a.id === acceptedId },
          now,
        ) || b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export function badgeLevelFromReputation(score: number): string {
  if (score >= 2000) return 'PLATINUM';
  if (score >= 500) return 'GOLD';
  if (score >= 100) return 'SILVER';
  if (score >= 25) return 'BRONZE';
  return 'CONTRIBUTOR';
}

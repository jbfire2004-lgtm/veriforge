import {
  computeAnswerRankScore,
  sortAnswersByRank,
  badgeLevelFromReputation,
} from './expert-qa-ranking';

describe('expert-qa-ranking', () => {
  const now = new Date('2026-05-18T12:00:00Z');

  it('ranks accepted answers higher', () => {
    const accepted = computeAnswerRankScore(
      {
        id: '1',
        voteScore: 2,
        isExpertAnswer: true,
        createdAt: new Date('2026-05-17T12:00:00Z'),
        isAccepted: true,
      },
      now,
    );
    const other = computeAnswerRankScore(
      {
        id: '2',
        voteScore: 5,
        isExpertAnswer: false,
        createdAt: now,
        isAccepted: false,
      },
      now,
    );
    expect(accepted).toBeGreaterThan(other);
  });

  it('sortAnswersByRank puts accepted first', () => {
    const sorted = sortAnswersByRank(
      [
        {
          id: 'a',
          voteScore: 0,
          isExpertAnswer: false,
          createdAt: now,
        },
        {
          id: 'b',
          voteScore: 1,
          isExpertAnswer: true,
          createdAt: new Date('2026-05-10T12:00:00Z'),
        },
      ],
      'b',
      now,
    );
    expect(sorted[0].id).toBe('b');
  });

  it('maps reputation to badge levels', () => {
    expect(badgeLevelFromReputation(0)).toBe('CONTRIBUTOR');
    expect(badgeLevelFromReputation(50)).toBe('BRONZE');
    expect(badgeLevelFromReputation(2500)).toBe('PLATINUM');
  });
});

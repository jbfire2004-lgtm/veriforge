import { ModerationAutoRulesService } from './moderation-auto-rules.service';

describe('ModerationAutoRulesService', () => {
  it('matches keyword rules', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'r1',
        name: 'spam',
        enabled: true,
        targetType: null,
        ruleType: 'KEYWORD_MATCH',
        config: { keywords: ['casino'] },
        priority: 10,
        action: 'FLAG',
      },
    ]);
    const prisma = { moderationAutoRule: { findMany } } as never;
    const svc = new ModerationAutoRulesService(prisma);
    const hits = await svc.evaluateContent(
      'FEED_ITEM',
      'item-1',
      'visit our casino today',
    );
    expect(hits).toHaveLength(1);
    expect(hits[0]?.ruleId).toBe('r1');
  });

  it('flags content from authors below reputation floor', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'r2',
        name: 'low rep',
        enabled: true,
        targetType: null,
        ruleType: 'REPUTATION_FLOOR',
        config: { minReputation: 100 },
        priority: 15,
        action: 'FLAG',
      },
    ]);
    const prisma = {
      moderationAutoRule: { findMany },
      expertQaAnswer: {
        findUnique: jest.fn().mockResolvedValue({ authorUserId: 42 }),
      },
      expertProfile: {
        findUnique: jest.fn().mockResolvedValue({ reputationScore: 10 }),
      },
    } as never;
    const svc = new ModerationAutoRulesService(prisma);
    const hits = await svc.evaluateContent(
      'EXPERT_QA_ANSWER',
      'ans-1',
      'helpful answer text',
    );
    expect(hits).toHaveLength(1);
    expect(hits[0]?.ruleId).toBe('r2');
  });
});

import { Injectable } from '@nestjs/common';
import type {
  ModerationAutoRuleType,
  ModerationTargetType,
} from '@prisma/client';
import type { ModerationAutoRule } from '@vera/api-contract';
import { PrismaService } from '../../prisma/prisma.service';

type RuleConfig = Record<string, unknown>;

@Injectable()
export class ModerationAutoRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async listRules(): Promise<ModerationAutoRule[]> {
    const rows = await this.prisma.moderationAutoRule.findMany({
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
    });
    return rows.map((r) => this.toDto(r));
  }

  async upsertRule(input: {
    id?: string;
    name: string;
    enabled?: boolean;
    targetType?: ModerationTargetType;
    ruleType: ModerationAutoRuleType;
    config: RuleConfig;
    priority?: number;
    action?: 'FLAG' | 'AUTO_HIDE';
  }): Promise<ModerationAutoRule> {
    const data = {
      name: input.name,
      enabled: input.enabled ?? true,
      targetType: input.targetType ?? null,
      ruleType: input.ruleType,
      config: input.config as never,
      priority: input.priority ?? 0,
      action: (input.action ?? 'FLAG') as never,
    };
    const row = input.id
      ? await this.prisma.moderationAutoRule.update({
          where: { id: input.id },
          data,
        })
      : await this.prisma.moderationAutoRule.create({ data });
    return this.toDto(row);
  }

  async evaluateContent(
    targetType: ModerationTargetType,
    targetId: string,
    text: string,
  ): Promise<
    { ruleId: string; action: 'FLAG' | 'AUTO_HIDE'; priority: number }[]
  > {
    const rules = await this.prisma.moderationAutoRule.findMany({
      where: { enabled: true },
      orderBy: { priority: 'desc' },
    });
    const hits: {
      ruleId: string;
      action: 'FLAG' | 'AUTO_HIDE';
      priority: number;
    }[] = [];
    const lower = text.toLowerCase();

    const applicable = rules.filter(
      (rule) => !rule.targetType || rule.targetType === targetType,
    );
    const reportRules = applicable.filter(
      (rule) => rule.ruleType === 'REPORT_THRESHOLD',
    );
    const reputationRules = applicable.filter(
      (rule) => rule.ruleType === 'REPUTATION_FLOOR',
    );

    // One report fetch for the max window; per-rule counts are filtered in memory.
    let reportCases: { createdAt: Date }[] = [];
    if (reportRules.length) {
      const maxHours = Math.max(
        ...reportRules.map((r) =>
          Number((r.config as RuleConfig).windowHours ?? 72),
        ),
        1,
      );
      reportCases = await this.prisma.moderationCase.findMany({
        where: {
          targetType,
          targetId,
          source: 'USER_REPORT',
          createdAt: { gte: new Date(Date.now() - maxHours * 3600_000) },
        },
        select: { createdAt: true },
      });
    }

    // Resolve author + reputation once for all REPUTATION_FLOOR rules.
    let reputationScore: number | null = null;
    if (reputationRules.length) {
      const authorId = await this.resolveAuthorUserId(targetType, targetId);
      if (authorId) {
        const profile = await this.prisma.expertProfile.findUnique({
          where: { userId: authorId },
          select: { reputationScore: true },
        });
        reputationScore = profile?.reputationScore ?? 0;
      }
    }

    for (const rule of applicable) {
      const config = rule.config as RuleConfig;

      if (rule.ruleType === 'KEYWORD_MATCH') {
        const keywords = (config.keywords as string[]) ?? [];
        if (keywords.some((k) => lower.includes(k.toLowerCase()))) {
          hits.push({
            ruleId: rule.id,
            action: rule.action as 'FLAG' | 'AUTO_HIDE',
            priority: rule.priority,
          });
        }
      }

      if (rule.ruleType === 'REPORT_THRESHOLD') {
        const threshold = Number(config.threshold ?? 3);
        const windowHours = Number(config.windowHours ?? 72);
        const sinceMs = Date.now() - windowHours * 3600_000;
        const count = reportCases.filter(
          (c) => c.createdAt.getTime() >= sinceMs,
        ).length;
        if (count >= threshold) {
          hits.push({
            ruleId: rule.id,
            action: rule.action as 'FLAG' | 'AUTO_HIDE',
            priority: rule.priority,
          });
        }
      }

      if (rule.ruleType === 'REPUTATION_FLOOR') {
        if (reputationScore == null) continue;
        const minReputation = Number(config.minReputation ?? 50);
        if (reputationScore < minReputation) {
          hits.push({
            ruleId: rule.id,
            action: rule.action as 'FLAG' | 'AUTO_HIDE',
            priority: rule.priority,
          });
        }
      }
    }

    return hits;
  }

  private async resolveAuthorUserId(
    targetType: ModerationTargetType,
    targetId: string,
  ): Promise<number | null> {
    switch (targetType) {
      case 'FEED_ITEM': {
        const row = await this.prisma.feedItem.findUnique({
          where: { id: targetId },
          include: { worker: { include: { user: true } } },
        });
        const meta = row?.metadata as Record<string, unknown> | null;
        if (meta?.authorUserId != null) {
          const uid = Number(meta.authorUserId);
          return uid > 0 ? uid : null;
        }
        return row?.worker?.user?.id ?? null;
      }
      case 'EXPERT_QA_QUESTION': {
        const row = await this.prisma.expertQaQuestion.findUnique({
          where: { id: targetId },
          select: { authorUserId: true },
        });
        return row?.authorUserId ?? null;
      }
      case 'EXPERT_QA_ANSWER': {
        const row = await this.prisma.expertQaAnswer.findUnique({
          where: { id: targetId },
          select: { authorUserId: true },
        });
        return row?.authorUserId ?? null;
      }
      case 'SAFETY_COMMENT': {
        const row = await this.prisma.safetyBlogComment.findUnique({
          where: { id: targetId },
          select: { userId: true },
        });
        return row?.userId ?? null;
      }
      case 'USER': {
        const uid = parseInt(targetId, 10);
        return Number.isNaN(uid) ? null : uid;
      }
      default:
        return null;
    }
  }

  private toDto(row: {
    id: string;
    name: string;
    enabled: boolean;
    targetType: ModerationTargetType | null;
    ruleType: ModerationAutoRuleType;
    config: unknown;
    priority: number;
    action: string;
  }): ModerationAutoRule {
    return {
      id: row.id,
      name: row.name,
      enabled: row.enabled,
      targetType: row.targetType,
      ruleType: row.ruleType as ModerationAutoRule['ruleType'],
      config: row.config as Record<string, unknown>,
      priority: row.priority,
      action: row.action as ModerationAutoRule['action'],
    };
  }
}

import { prisma } from "../lib/prisma";
import { ExpiryRules } from "../types/rules";

const DEFAULT_RULES: ExpiryRules = {
  orientationExpiryDays: 90,
  certificationExpiryDays: 365,
  notSeenDays: 30,
  autoDeactivate: true,
  autoNotify: true,
};

export class ExpiryRulesService {
  async getRules(): Promise<ExpiryRules> {
    const existing = await prisma.expiryRuleSet.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!existing) {
      const created = await prisma.expiryRuleSet.create({
        data: DEFAULT_RULES,
      });
      return this.toRules(created);
    }

    return this.toRules(existing);
  }

  async updateRules(patch: Partial<ExpiryRules>): Promise<ExpiryRules> {
    const current = await this.getRules();
    const next = { ...current, ...patch };

    const existing = await prisma.expiryRuleSet.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    if (!existing) {
      const created = await prisma.expiryRuleSet.create({ data: next });
      return this.toRules(created);
    }

    const updated = await prisma.expiryRuleSet.update({
      where: { id: existing.id },
      data: next,
    });

    return this.toRules(updated);
  }

  private toRules(row: {
    orientationExpiryDays: number;
    certificationExpiryDays: number;
    notSeenDays: number;
    autoDeactivate: boolean;
    autoNotify: boolean;
  }): ExpiryRules {
    return {
      orientationExpiryDays: row.orientationExpiryDays,
      certificationExpiryDays: row.certificationExpiryDays,
      notSeenDays: row.notSeenDays,
      autoDeactivate: row.autoDeactivate,
      autoNotify: row.autoNotify,
    };
  }
}

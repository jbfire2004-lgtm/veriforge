const LEVEL_SCORES: Record<string, number> = {
  basic: 50,
  intermediate: 75,
  advanced: 90,
  expert: 100,
};

export class ExpiryEngine {
  computeExpiry(completionDate: Date, expiryDays: number): Date {
    const expiry = new Date(completionDate);
    expiry.setDate(expiry.getDate() + expiryDays);
    return expiry;
  }

  isExpired(expiryDate: Date | null, now = new Date()): boolean {
    if (!expiryDate) return false;
    return expiryDate.getTime() < now.getTime();
  }

  isExpiringSoon(expiryDate: Date | null, withinDays = 30, now = new Date()): boolean {
    if (!expiryDate) return false;
    const threshold = now.getTime() + withinDays * 24 * 60 * 60 * 1000;
    return expiryDate.getTime() <= threshold && expiryDate.getTime() > now.getTime();
  }
}

export class CompetencyEngine {
  scoreFromLevel(level: string): number {
    return LEVEL_SCORES[level.toLowerCase()] ?? 50;
  }

  aggregate(records: Array<{ competencyScore: number; status: string }>): number {
    const active = records.filter((r) => r.status === 'verified' || r.status === 'completed');
    if (active.length === 0) return 0;
    return Math.round(active.reduce((s, r) => s + r.competencyScore, 0) / active.length);
  }

  levelFromScore(score: number): string {
    if (score >= 95) return 'expert';
    if (score >= 80) return 'advanced';
    if (score >= 65) return 'intermediate';
    return 'basic';
  }
}

export const expiryEngine = new ExpiryEngine();
export const competencyEngine = new CompetencyEngine();

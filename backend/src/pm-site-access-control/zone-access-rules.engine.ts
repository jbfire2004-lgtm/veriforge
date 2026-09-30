export type ZoneRuleContext = {
  timeWindowStart?: string | null;
  timeWindowEnd?: string | null;
  requiresJha: boolean;
  requiresSdsAck: boolean;
  requiresPermitIds: string[];
  requiredPpe: string[];
};

export class ZoneAccessRulesEngine {
  isWithinTimeWindow(
    start?: string | null,
    end?: string | null,
    now = new Date(),
  ): boolean {
    if (!start && !end) return true;
    const mins = now.getHours() * 60 + now.getMinutes();
    const parse = (s: string) => {
      const [h, m] = s.split(':').map(Number);
      return h * 60 + (m ?? 0);
    };
    if (start && end) {
      const a = parse(start);
      const b = parse(end);
      if (a <= b) return mins >= a && mins <= b;
      return mins >= a || mins <= b;
    }
    if (start) return mins >= parse(start);
    if (end) return mins <= parse(end);
    return true;
  }

  evaluateTimeWindow(rule: ZoneRuleContext): string | null {
    if (!this.isWithinTimeWindow(rule.timeWindowStart, rule.timeWindowEnd)) {
      return 'Outside permitted zone access time window';
    }
    return null;
  }
}

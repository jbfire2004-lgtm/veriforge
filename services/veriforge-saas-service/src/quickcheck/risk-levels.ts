/**
 * QuickCheck risk levels: green (low), yellow (medium), red (high).
 */
export type QuickCheckRiskLevel = 'green' | 'yellow' | 'red';

export type MissingItemSeverity = 'critical' | 'major' | 'minor';

export type QuickCheckMissingItem = {
  code: string;
  label: string;
  severity: MissingItemSeverity;
  source: 'documents' | 'audits' | 'pvs' | 'insurance';
};

export function deriveRiskLevel(input: {
  complianceScore: number;
  missingItems: QuickCheckMissingItem[];
}): QuickCheckRiskLevel {
  const critical = input.missingItems.filter((m) => m.severity === 'critical');
  const major = input.missingItems.filter((m) => m.severity === 'major');

  if (critical.length > 0 || input.complianceScore < 60) return 'red';
  if (major.length > 0 || input.complianceScore < 80) return 'yellow';
  return 'green';
}

export const RISK_LEVEL_META: Record<
  QuickCheckRiskLevel,
  { label: string; description: string }
> = {
  green: { label: 'Low risk', description: 'Compliance healthy; no critical gaps' },
  yellow: {
    label: 'Medium risk',
    description: 'Gaps or score below 80 — review recommended',
  },
  red: {
    label: 'High risk',
    description: 'Critical gaps or score below 60 — action required',
  },
};

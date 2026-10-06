import { Injectable } from '@nestjs/common';

export interface JurisdictionRequirementRow {
  jurisdictionCode: string;
  standardCode: string;
  required: boolean;
  regionName: string;
}

export interface JurisdictionMatchResult {
  jurisdictionCode: string;
  matched: string[];
  missing: string[];
  score: number;
}

@Injectable()
export class JurisdictionMatchingEngine {
  match(
    jurisdictionCode: string,
    requirements: JurisdictionRequirementRow[],
    satisfiedStandardCodes: string[],
  ): JurisdictionMatchResult {
    const satisfied = new Set(satisfiedStandardCodes);
    const applicable = requirements.filter(
      (r) =>
        r.jurisdictionCode === jurisdictionCode ||
        r.jurisdictionCode === 'CA-FED',
    );
    const required = applicable.filter((r) => r.required);
    const matched = required
      .map((r) => r.standardCode)
      .filter((c) => satisfied.has(c));
    const missing = required
      .map((r) => r.standardCode)
      .filter((c) => !satisfied.has(c));

    const score =
      required.length === 0
        ? 100
        : Math.round((matched.length / required.length) * 100);

    return {
      jurisdictionCode,
      matched,
      missing,
      score,
    };
  }

  /** Resolve jurisdiction from site region, project, or default ON. */
  normalizeJurisdiction(region?: string | null): string {
    if (!region?.trim()) return 'ON';
    const r = region.trim().toUpperCase();
    if (
      [
        'ON',
        'BC',
        'AB',
        'SK',
        'MB',
        'QC',
        'NB',
        'NS',
        'PE',
        'NL',
        'YT',
        'NT',
        'NU',
      ].includes(r)
    ) {
      return r;
    }
    if (r.includes('ONTARIO')) return 'ON';
    if (r.includes('BRITISH') || r.includes('BC')) return 'BC';
    if (r.includes('ALBERTA')) return 'AB';
    if (r.includes('FEDERAL') || r.includes('CANADA')) return 'CA-FED';
    return 'ON';
  }
}

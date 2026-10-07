import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { SMS_K_ANONYMITY } from '../constants';

const PII_PATTERNS: RegExp[] = [
  /\b[\w.+-]+@[\w.-]+\.\w{2,}\b/gi,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, // SSN-like
];

export interface IndustryBenchmarkSnapshot {
  cohortId?: string;
  industryCode: string;
  regionScope: string;
  metricKey: string;
  entityValue: number | null;
  industryP50: number | null;
  delta: number | null;
  betterThanIndustry: boolean | null;
  percentileApprox?: number | null;
  cohortN: number;
  suppressed: boolean;
  asOf: string;
}

@Injectable()
export class SmsAnonymizationService {
  readonly k = SMS_K_ANONYMITY;

  /** Suppress cells / cohorts when n < k. */
  suppressIfBelowK<T extends { headcount?: number; cohortN?: number; n?: number }>(
    row: T,
  ): T & { suppressed: boolean } {
    const n = row.headcount ?? row.cohortN ?? row.n ?? 0;
    const suppressed = n < this.k;
    if (!suppressed) return { ...row, suppressed: false };
    return {
      ...row,
      suppressed: true,
      ...( 'coveragePct' in row ? { coveragePct: null } : {}),
      ...( 'riskIndex' in row ? { riskIndex: null } : {}),
      ...( 'p25' in row ? { p25: null, p50: null, p75: null, mean: null } : {}),
    };
  }

  /** Strip PII from LLM prompt payloads; abort flag if redaction incomplete. */
  redactForLlm(text: string): { text: string; ok: boolean } {
    let out = text;
    for (const re of PII_PATTERNS) {
      out = out.replace(re, '[REDACTED]');
    }
    // Names in witness-style quotes — conservative scrub of "said X"
    out = out.replace(/\b(witness|employee|worker)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g, '$1 [ROLE]');
    const stillLooksLikePhone = /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(out);
    const stillEmail = /@/.test(out) && /\.\w{2,}/.test(out);
    return { text: out, ok: !stillLooksLikePhone && !stillEmail };
  }

  /** HMAC worker analytics key — never store raw workerId in aggregates. */
  workerAnalyticsKey(workerId: string | number, tenantSalt: string): string {
    return createHmac('sha256', tenantSalt)
      .update(String(workerId))
      .digest('hex')
      .slice(0, 32);
  }

  redactDisplayName(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return 'Worker';
    const first = parts[0]?.[0] ?? 'W';
    return `${first}. ****`;
  }

  buildBenchmarkSnapshot(params: {
    cohortId?: string;
    industryCode: string;
    regionScope: string;
    metricKey: string;
    entityValue: number | null;
    p50: number | null;
    cohortN: number;
    /** For rates, lower is better */
    lowerIsBetter?: boolean;
  }): IndustryBenchmarkSnapshot {
    const suppressed = params.cohortN < this.k;
    if (suppressed) {
      return {
        cohortId: params.cohortId,
        industryCode: params.industryCode,
        regionScope: params.regionScope,
        metricKey: params.metricKey,
        entityValue: params.entityValue,
        industryP50: null,
        delta: null,
        betterThanIndustry: null,
        cohortN: params.cohortN,
        suppressed: true,
        asOf: new Date().toISOString(),
      };
    }
    const delta =
      params.entityValue != null && params.p50 != null
        ? Math.round((params.entityValue - params.p50) * 10000) / 10000
        : null;
    const lowerIsBetter = params.lowerIsBetter ?? true;
    const betterThanIndustry =
      delta == null ? null : lowerIsBetter ? delta < 0 : delta > 0;
    return {
      cohortId: params.cohortId,
      industryCode: params.industryCode,
      regionScope: params.regionScope,
      metricKey: params.metricKey,
      entityValue: params.entityValue,
      industryP50: params.p50,
      delta,
      betterThanIndustry,
      cohortN: params.cohortN,
      suppressed: false,
      asOf: new Date().toISOString(),
    };
  }
}

import {
  SMS_BEHAVIORS,
  SMS_CONFIDENCE,
  SMS_K_ANONYMITY,
  type SmsBehaviorId,
} from '../constants';
import { SmsException } from './sms-errors';

export type SmsAiGuardrailCode =
  | 'confidence_hidden'
  | 'confidence_caution'
  | 'k_anonymity'
  | 'pii_redaction_abort'
  | 'no_llm_phone'
  | 'accept_required'
  | 'degraded_fallback'
  | 'entitlement';

export interface SmsAiGuardrailResult {
  ok: boolean;
  code?: SmsAiGuardrailCode;
  message?: string;
  visibility: 'hidden' | 'caution' | 'suggest' | 'rank';
  degraded?: boolean;
}

/** Shared AI guardrails (Complete AI Spec). */
export function confidenceVisibility(
  confidence: number,
): SmsAiGuardrailResult['visibility'] {
  if (confidence < SMS_CONFIDENCE.hide) return 'hidden';
  if (confidence < SMS_CONFIDENCE.caution) return 'caution';
  if (confidence < SMS_CONFIDENCE.suggest) return 'suggest';
  return 'rank';
}

export function enforceConfidence(confidence: number): SmsAiGuardrailResult {
  const visibility = confidenceVisibility(confidence);
  if (visibility === 'hidden') {
    return {
      ok: false,
      code: 'confidence_hidden',
      message: `Confidence ${confidence} below hide threshold ${SMS_CONFIDENCE.hide}`,
      visibility,
    };
  }
  return {
    ok: true,
    code: visibility === 'caution' ? 'confidence_caution' : undefined,
    visibility,
  };
}

export function enforceKAnonymity(n: number): SmsAiGuardrailResult {
  if (n < SMS_K_ANONYMITY) {
    return {
      ok: false,
      code: 'k_anonymity',
      message: `Sample n=${n} < k=${SMS_K_ANONYMITY}; suppress output`,
      visibility: 'hidden',
    };
  }
  return { ok: true, visibility: 'rank' };
}

/** Reject any non-911 synthetic phone invent attempt. */
export function enforceNoLlmPhone(phones: string[]): SmsAiGuardrailResult {
  for (const p of phones) {
    const digits = p.replace(/\D/g, '');
    if (digits && digits !== '911' && digits !== '112') {
      // Verified provider catalog may include real numbers — only block
      // clearly fabricated placeholder patterns
      if (/^(555|000|123)/.test(digits) || /GENERATED|FAKE|LLM/i.test(p)) {
        return {
          ok: false,
          code: 'no_llm_phone',
          message: 'Invented EMS phone numbers are forbidden',
          visibility: 'hidden',
        };
      }
    }
  }
  return { ok: true, visibility: 'rank' };
}

export function assertAcceptBeforeSor(
  suggestionId: string | undefined | null,
  requireSuggestion: boolean,
): void {
  if (requireSuggestion && !suggestionId) {
    throw new SmsException(
      'BUSINESS_RULE',
      'AI suggestion must be accepted before system-of-record write',
      { code: 'accept_required' },
    );
  }
}

export const BEHAVIOR_PAGE_MAP: Record<string, SmsBehaviorId[]> = {
  home: [SMS_BEHAVIORS.HOME, SMS_BEHAVIORS.CROSS_PAGE, SMS_BEHAVIORS.BENCHMARK],
  incidents: [
    SMS_BEHAVIORS.INVESTIGATION,
    SMS_BEHAVIORS.ROOT_CAUSE,
    SMS_BEHAVIORS.ACTION_CORRECTIVE,
  ],
  'jha-flha': [
    SMS_BEHAVIORS.FLHA_HAZARDS,
    SMS_BEHAVIORS.FLHA_QUALITY,
    SMS_BEHAVIORS.JHA_BUILDER,
    SMS_BEHAVIORS.JHA_RISK,
  ],
  inspections: [
    SMS_BEHAVIORS.INSPECTION_FOCUS,
    SMS_BEHAVIORS.INSPECTION_QUALITY,
  ],
  meetings: [SMS_BEHAVIORS.MEETING_TOPICS],
  actions: [
    SMS_BEHAVIORS.ACTION_CORRECTIVE,
    SMS_BEHAVIORS.ACTION_PREVENTIVE,
  ],
  emergency: [SMS_BEHAVIORS.ERP_DRAFT, SMS_BEHAVIORS.ERP_SIM],
  training: [SMS_BEHAVIORS.COMPETENCY],
  predictive: [SMS_BEHAVIORS.COMPETENCY, SMS_BEHAVIORS.HOME],
  regional: [SMS_BEHAVIORS.REGIONAL, SMS_BEHAVIORS.BENCHMARK],
};

export function behaviorsForPage(page: string): SmsBehaviorId[] {
  return BEHAVIOR_PAGE_MAP[page] ?? [SMS_BEHAVIORS.CROSS_PAGE];
}

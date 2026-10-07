import {
  confidenceVisibility,
  enforceConfidence,
  enforceKAnonymity,
  enforceNoLlmPhone,
  behaviorsForPage,
  BEHAVIOR_PAGE_MAP,
} from '../common/sms-ai-guardrails';
import { SMS_BEHAVIORS, SMS_CONFIDENCE, SMS_K_ANONYMITY } from '../constants';
import { SMS_QA_AI_BEHAVIORS } from '../qa/sms-qa-catalog';

describe('SMS AI guardrails', () => {
  it('hides confidence below hide threshold', () => {
    expect(confidenceVisibility(0.5)).toBe('hidden');
    expect(enforceConfidence(0.5).ok).toBe(false);
    expect(enforceConfidence(0.5).code).toBe('confidence_hidden');
  });

  it('marks caution / suggest / rank bands', () => {
    expect(confidenceVisibility(SMS_CONFIDENCE.hide)).toBe('caution');
    expect(confidenceVisibility(0.72)).toBe('suggest');
    expect(confidenceVisibility(SMS_CONFIDENCE.suggest)).toBe('rank');
  });

  it('enforces k-anonymity default of 5', () => {
    expect(SMS_K_ANONYMITY).toBe(5);
    expect(enforceKAnonymity(4).ok).toBe(false);
    expect(enforceKAnonymity(4).code).toBe('k_anonymity');
    expect(enforceKAnonymity(5).ok).toBe(true);
  });

  it('blocks invented EMS phone patterns', () => {
    expect(enforceNoLlmPhone(['911']).ok).toBe(true);
    expect(enforceNoLlmPhone(['555-0100']).ok).toBe(false);
    expect(enforceNoLlmPhone(['LLM-GENERATED-555']).ok).toBe(false);
  });

  it('maps every AI behavior id AI-01…18', () => {
    const ids = Object.values(SMS_BEHAVIORS);
    expect(ids).toHaveLength(18);
    for (const b of SMS_QA_AI_BEHAVIORS) {
      expect(ids).toContain(b.id);
    }
  });

  it('provides page → behavior bundles including cross-page and regional', () => {
    expect(BEHAVIOR_PAGE_MAP.home).toContain(SMS_BEHAVIORS.HOME);
    expect(BEHAVIOR_PAGE_MAP.regional).toContain(SMS_BEHAVIORS.REGIONAL);
    expect(behaviorsForPage('incidents')).toContain(SMS_BEHAVIORS.INVESTIGATION);
    expect(behaviorsForPage('unknown-page')).toEqual([SMS_BEHAVIORS.CROSS_PAGE]);
  });
});

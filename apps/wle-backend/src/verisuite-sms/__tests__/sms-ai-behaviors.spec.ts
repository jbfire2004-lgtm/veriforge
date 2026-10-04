import { SMS_BEHAVIORS } from '../constants';
import { SMS_QA_AI_BEHAVIORS } from '../qa/sms-qa-catalog';
import { behaviorsForPage } from '../common/sms-ai-guardrails';

describe('SMS AI behavior matrix (every AI-0X)', () => {
  for (const behavior of SMS_QA_AI_BEHAVIORS) {
    it(`${behavior.id} · ${behavior.name} is registered`, () => {
      expect(Object.values(SMS_BEHAVIORS)).toContain(behavior.id);
      expect(behavior.tier).toMatch(/^D[01]$|^L[12]$/);
      expect(behavior.page.length).toBeGreaterThan(0);
    });
  }

  it('cross-page intelligence (AI-17) participates in home bundle', () => {
    expect(behaviorsForPage('home')).toEqual(
      expect.arrayContaining([SMS_BEHAVIORS.HOME, SMS_BEHAVIORS.CROSS_PAGE]),
    );
  });

  it('regional intelligence (AI-18) is page-scoped', () => {
    expect(behaviorsForPage('regional')).toContain(SMS_BEHAVIORS.REGIONAL);
  });

  const pageCases: Array<{ page: string; mustInclude: string }> = [
    { page: 'jha-flha', mustInclude: SMS_BEHAVIORS.FLHA_QUALITY },
    { page: 'emergency', mustInclude: SMS_BEHAVIORS.ERP_DRAFT },
    { page: 'inspections', mustInclude: SMS_BEHAVIORS.INSPECTION_FOCUS },
    { page: 'incidents', mustInclude: SMS_BEHAVIORS.INVESTIGATION },
    { page: 'meetings', mustInclude: SMS_BEHAVIORS.MEETING_TOPICS },
    { page: 'actions', mustInclude: SMS_BEHAVIORS.ACTION_CORRECTIVE },
    { page: 'training', mustInclude: SMS_BEHAVIORS.COMPETENCY },
  ];

  for (const c of pageCases) {
    it(`page "${c.page}" includes ${c.mustInclude}`, () => {
      expect(behaviorsForPage(c.page)).toContain(c.mustInclude);
    });
  }
});

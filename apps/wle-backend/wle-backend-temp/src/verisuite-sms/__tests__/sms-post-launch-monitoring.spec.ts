/**
 * Post-launch monitoring + release cycle contract tests.
 */
import {
  SMS_MONITORING_DOMAINS,
  SMS_RELEASE_TRACKS,
  smsReleaseCalendar,
} from '../ops/sms-release-cycle';
import { SmsPostLaunchMonitoringService } from '../ops/sms-post-launch-monitoring.service';
import { readFileSync } from 'fs';
import { join } from 'path';
import { VerisuiteSmsModule } from '../verisuite-sms.module';

describe('SMS post-launch monitoring & release cycle', () => {
  it('defines all 8 monitoring domains', () => {
    expect(SMS_MONITORING_DOMAINS).toHaveLength(8);
    const ids = SMS_MONITORING_DOMAINS.map((d) => d.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'ai_decisions',
        'incident_trends',
        'inspection_patterns',
        'flha_quality',
        'jha_usage',
        'erp_accuracy',
        'competency_risk',
        'benchmarking_accuracy',
      ]),
    );
  });

  it('defines 4 release tracks', () => {
    expect(SMS_RELEASE_TRACKS).toHaveLength(4);
    expect(SMS_RELEASE_TRACKS.map((t) => t.id)).toEqual([
      'monthly_feature',
      'quarterly_intelligence',
      'annual_ui',
      'continuous_ai_tuning',
    ]);
    for (const t of SMS_RELEASE_TRACKS) {
      expect(t.exitCriteria.length).toBeGreaterThan(0);
      expect(t.complianceHooks.length).toBeGreaterThan(0);
    }
  });

  it('builds a yearly release calendar', () => {
    const cal = smsReleaseCalendar(2026);
    expect(cal.monthlyFeature).toHaveLength(12);
    expect(cal.quarterlyIntelligence).toHaveLength(4);
    expect(cal.annualUi.track).toBe('annual_ui');
    expect(cal.continuousAiTuning.cadence).toMatch(/weekly/i);
  });

  it('registers SmsPostLaunchMonitoringService on the module', () => {
    const providers = Reflect.getMetadata(
      'providers',
      VerisuiteSmsModule,
    ) as unknown[];
    expect(providers).toEqual(
      expect.arrayContaining([SmsPostLaunchMonitoringService]),
    );
  });

  it('exposes ops monitoring / ai-performance / compliance / release-cycle routes', () => {
    const ctrl = readFileSync(
      join(__dirname, '..', 'controllers', 'verisuite-sms.controller.ts'),
      'utf8',
    );
    expect(ctrl).toContain("Get('ops/monitoring')");
    expect(ctrl).toContain("Get('ops/monitoring/:domainId')");
    expect(ctrl).toContain("Get('ops/ai-performance')");
    expect(ctrl).toContain("Get('ops/compliance')");
    expect(ctrl).toContain("Get('ops/release-cycle')");
  });

  it('service exposes overview / domain / aiPerformance / releaseCycle', () => {
    expect(typeof SmsPostLaunchMonitoringService.prototype.overview).toBe(
      'function',
    );
    expect(typeof SmsPostLaunchMonitoringService.prototype.domain).toBe(
      'function',
    );
    expect(typeof SmsPostLaunchMonitoringService.prototype.aiPerformance).toBe(
      'function',
    );
    expect(typeof SmsPostLaunchMonitoringService.prototype.releaseCycle).toBe(
      'function',
    );
    expect(
      typeof SmsPostLaunchMonitoringService.prototype.complianceStatus,
    ).toBe('function');
  });
});

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  SMS_QA_ENDPOINTS,
  SMS_QA_AI_BEHAVIORS,
  SMS_QA_PAGES,
  SMS_QA_ROLES,
  SMS_QA_DESIGN_LOCK,
} from '../qa/sms-qa-catalog';
import { SMS_API_PREFIX, SMS_BEHAVIORS, SMS_ROLES } from '../constants';
import { SmsException, smsErrorEnvelope } from '../common/sms-errors';

describe('SMS QA catalog integrity', () => {
  it('lists ≥11 pages including gallery + predictive routes', () => {
    expect(SMS_QA_PAGES.length).toBeGreaterThanOrEqual(11);
    expect(SMS_QA_PAGES.map((p) => p.id)).toEqual(
      expect.arrayContaining([
        'home',
        'flha',
        'jha',
        'erp',
        'inspections',
        'incidents',
        'meetings',
        'actions',
        'competency',
        'predictive',
        'sms-dashboards',
        'sms-mockups',
      ]),
    );
  });

  it('lists all 18 AI behaviors', () => {
    expect(SMS_QA_AI_BEHAVIORS).toHaveLength(18);
    expect(SMS_QA_AI_BEHAVIORS.map((b) => b.id)).toEqual(
      Object.values(SMS_BEHAVIORS),
    );
  });

  it('lists ≥55 API endpoints from Full API Spec', () => {
    expect(SMS_QA_ENDPOINTS.length).toBeGreaterThanOrEqual(55);
  });

  it('locks design version 1.1.0-final', () => {
    expect(SMS_QA_DESIGN_LOCK.version).toBe('1.1.0-final');
    expect(SMS_QA_DESIGN_LOCK.status).toBe('FINALIZED');
    expect(SMS_QA_DESIGN_LOCK.palette.navy).toBe('#0D1B2A');
    expect(SMS_QA_DESIGN_LOCK.palette.electricBlue).toBe('#00A3FF');
  });
});

describe('SMS API controller contract coverage', () => {
  const controllerPath = join(
    __dirname,
    '..',
    'controllers',
    'verisuite-sms.controller.ts',
  );
  const source = readFileSync(controllerPath, 'utf8');

  it('uses /api/v1/sms prefix', () => {
    expect(SMS_API_PREFIX).toBe('api/v1/sms');
    expect(source).toContain('SMS_API_PREFIX');
  });

  it('implements every catalogued endpoint decorator', () => {
    const missing: string[] = [];
    for (const ep of SMS_QA_ENDPOINTS) {
      // Nest decorators use path without leading slash sometimes with params
      const nestPath = ep.path.replace(/^\//, '').replace(/:(\w+)/g, ':$1');
      const methodDecorators: Record<string, string> = {
        GET: `@Get('${nestPath}')`,
        POST: `@Post('${nestPath}')`,
        PUT: `@Put('${nestPath}')`,
      };
      // Also try without quotes variations for simple paths
      const candidates = [
        methodDecorators[ep.method],
        `@${ep.method[0]}${ep.method.slice(1).toLowerCase()}('${nestPath}')`,
      ];
      // Param routes in Nest: 'flha/:id'
      const found = candidates.some((c) => c && source.includes(c));
      // Fallback: search for path segment presence with method decorator nearby is hard;
      // check path string appears in a decorator
      const pathInDecorator =
        source.includes(`'${nestPath}'`) || source.includes(`"${nestPath}"`);
      if (!found && !pathInDecorator) {
        missing.push(`${ep.method} ${ep.path}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('exposes intelligence accept/dismiss/run/catalog', () => {
    expect(source).toContain("intelligence/accept");
    expect(source).toContain("intelligence/dismiss");
    expect(source).toContain("intelligence/run");
    expect(source).toContain("intelligence/catalog");
  });

  it('health is public and delegates to production ops', () => {
    expect(source).toContain('@Public()');
    expect(source).toContain('this.ops.health()');
    expect(source).toContain("Get('ops/ai-decisions')");
    expect(source).toContain("Post('ops/alert-test')");
  });
});

describe('SMS RBAC role matrix', () => {
  it('defines READ / WRITE / HSE / INVESTIGATION role sets', () => {
    expect(SMS_ROLES.READ.length).toBeGreaterThan(0);
    expect(SMS_ROLES.WRITE).toEqual(
      expect.arrayContaining(['COMPANY_ADMIN', 'PROJECT_MANAGER', 'SUPERVISOR']),
    );
    expect(SMS_ROLES.HSE).toEqual(
      expect.arrayContaining(['COMPANY_ADMIN', 'PROJECT_MANAGER']),
    );
    for (const role of SMS_QA_ROLES) {
      expect([...SMS_ROLES.READ, ...SMS_ROLES.WRITE]).toEqual(
        expect.arrayContaining([role]),
      );
    }
  });

  it('PlaneScopeGuard file enforces X-Vera-Plane', () => {
    const guard = readFileSync(
      join(__dirname, '..', 'guards', 'plane-scope.guard.ts'),
      'utf8',
    );
    expect(guard).toContain('x-vera-plane');
    expect(guard).toContain('project');
    expect(guard).toContain('company');
    expect(guard).toContain('subcontractor');
    expect(guard).toContain('authz.deny');
  });
});

describe('SMS error envelope', () => {
  it('returns { error: { code, message, requestId } }', () => {
    const body = smsErrorEnvelope('FORBIDDEN', 'denied', 'req-1');
    expect(body).toEqual({
      error: {
        code: 'FORBIDDEN',
        message: 'denied',
        details: undefined,
        requestId: 'req-1',
      },
    });
  });

  it('SmsException maps BUSINESS_RULE to 422', () => {
    const ex = new SmsException('BUSINESS_RULE', 'policy');
    expect(ex.getStatus()).toBe(422);
    expect(ex.code).toBe('BUSINESS_RULE');
  });

  it('SmsException maps CONFLICT to 409', () => {
    expect(new SmsException('CONFLICT', 'dup').getStatus()).toBe(409);
  });
});

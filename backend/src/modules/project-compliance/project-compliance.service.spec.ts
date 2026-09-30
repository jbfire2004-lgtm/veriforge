import {
  evaluateWorkerCompliance,
  ruleAppliesToWorker,
  type EvaluatorRule,
} from './project-compliance-evaluator';

const whmisRule: EvaluatorRule = {
  id: 1,
  ruleType: 'ALL_WORKERS',
  requiredCredentialTypeId: 10,
  certificationCode: 'WHMIS',
  certificationName: 'WHMIS',
  metadata: {},
};

const supervisorRule: EvaluatorRule = {
  id: 2,
  ruleType: 'ROLE',
  requiredCredentialTypeId: 20,
  certificationCode: 'SUP-LEAD',
  certificationName: 'Supervisor Leadership',
  metadata: { roles: ['supervisor'] },
};

const electricianRule: EvaluatorRule = {
  id: 3,
  ruleType: 'TRADE',
  requiredCredentialTypeId: 30,
  certificationCode: 'ELEC-ARC',
  certificationName: 'Arc Flash',
  metadata: { trades: ['electrician'] },
};

describe('project-compliance-evaluator', () => {
  const now = new Date('2026-06-15T12:00:00.000Z');

  it('applies ALL_WORKERS rules to every worker', () => {
    expect(
      ruleAppliesToWorker(whmisRule, { role: 'laborer', trade: null }),
    ).toBe(true);
  });

  it('applies ROLE rules only to matching roles', () => {
    expect(
      ruleAppliesToWorker(supervisorRule, {
        role: 'site supervisor',
        trade: null,
      }),
    ).toBe(true);
    expect(
      ruleAppliesToWorker(supervisorRule, { role: 'laborer', trade: null }),
    ).toBe(false);
  });

  it('applies TRADE rules only to matching trades', () => {
    expect(
      ruleAppliesToWorker(electricianRule, {
        role: null,
        trade: 'Electrician',
      }),
    ).toBe(true);
    expect(
      ruleAppliesToWorker(electricianRule, { role: null, trade: 'ironworker' }),
    ).toBe(false);
  });

  it('marks worker compliant when all applicable credentials are valid', () => {
    const result = evaluateWorkerCompliance(
      {
        id: 1,
        firstName: 'Alex',
        lastName: 'Rivera',
        role: 'laborer',
        trade: null,
      },
      [whmisRule],
      [
        {
          id: 100,
          certificationId: 10,
          expiresAt: new Date('2027-01-01'),
          lastVerificationStatus: 'VERIFIED',
        },
      ],
      now,
    );
    expect(result.isCompliant).toBe(true);
    expect(result.gaps).toHaveLength(0);
  });

  it('reports missing and expired credentials with reasons', () => {
    const missing = evaluateWorkerCompliance(
      {
        id: 2,
        firstName: 'Sam',
        lastName: 'Lee',
        role: 'laborer',
        trade: null,
      },
      [whmisRule],
      [],
      now,
    );
    expect(missing.isCompliant).toBe(false);
    expect(missing.gaps[0]?.status).toBe('missing');

    const expired = evaluateWorkerCompliance(
      {
        id: 3,
        firstName: 'Pat',
        lastName: 'Ng',
        role: 'laborer',
        trade: null,
      },
      [whmisRule],
      [
        {
          id: 101,
          certificationId: 10,
          expiresAt: new Date('2026-01-01'),
          lastVerificationStatus: 'VERIFIED',
        },
      ],
      now,
    );
    expect(expired.gaps[0]?.status).toBe('expired');
  });

  it('flags expiring soon without blocking compliance', () => {
    const result = evaluateWorkerCompliance(
      {
        id: 4,
        firstName: 'Jo',
        lastName: 'Kim',
        role: 'laborer',
        trade: null,
      },
      [whmisRule],
      [
        {
          id: 102,
          certificationId: 10,
          expiresAt: new Date('2026-07-01'),
          lastVerificationStatus: 'VERIFIED',
        },
      ],
      now,
    );
    expect(result.isCompliant).toBe(true);
    expect(result.expiringSoon).toHaveLength(1);
    expect(result.expiringSoon[0]?.status).toBe('expiring_soon');
  });

  it('evaluates mixed role and trade rules independently', () => {
    const supervisor = evaluateWorkerCompliance(
      {
        id: 5,
        firstName: 'Chris',
        lastName: 'Diaz',
        role: 'supervisor',
        trade: 'electrician',
      },
      [whmisRule, supervisorRule, electricianRule],
      [
        {
          id: 200,
          certificationId: 10,
          expiresAt: new Date('2027-01-01'),
          lastVerificationStatus: 'VERIFIED',
        },
        {
          id: 201,
          certificationId: 20,
          expiresAt: new Date('2027-01-01'),
          lastVerificationStatus: 'VERIFIED',
        },
      ],
      now,
    );
    expect(supervisor.isCompliant).toBe(false);
    expect(
      supervisor.gaps.some((g) => g.certificationName === 'Arc Flash'),
    ).toBe(true);
  });
});

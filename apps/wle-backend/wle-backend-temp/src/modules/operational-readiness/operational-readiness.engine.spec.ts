import { evaluateOperationalReadiness } from './operational-readiness.engine';

describe('OperationalReadinessEngine', () => {
  const exampleInput = {
    engines: [
      {
        name: 'TAE',
        unitTestsPassRate: 0.95,
        integrationTestsPassRate: 0.9,
        knownIssues: [
          {
            id: 'ISS-1',
            severity: 'Medium' as const,
            description: 'No HTTP assess endpoint',
          },
        ],
        testScenariosImplemented: [
          'Expired training',
          'Unapproved provider',
          'Insufficient competency',
        ],
        testScenariosMissing: ['Multi-jurisdiction worker'],
      },
      {
        name: 'SPCE',
        unitTestsPassRate: 1,
        integrationTestsPassRate: 0,
        knownIssues: [],
        testScenariosImplemented: [
          'Missing policy',
          'Outdated procedure',
          'Partial structure',
        ],
        testScenariosMissing: [],
      },
      {
        name: 'SGAE',
        unitTestsPassRate: 1,
        integrationTestsPassRate: 0,
        knownIssues: [],
        testScenariosImplemented: ['SPCE+TAE synthesis'],
        testScenariosMissing: ['End-to-end with live Prisma mappers'],
      },
      {
        name: 'CAIL-SMS',
        unitTestsPassRate: 0.8,
        integrationTestsPassRate: 0.5,
        knownIssues: [
          {
            id: 'CAIL-1',
            severity: 'Medium' as const,
            description: 'SGAE ingest not wired',
          },
        ],
        testScenariosImplemented: ['Unified intelligence API'],
        testScenariosMissing: ['TAE/SPCE/SGAE composite ingest'],
      },
    ],
    integration: {
      taeToSpce: {
        implemented: true,
        tested: true,
        issues: [],
      },
      spceToSgae: {
        implemented: true,
        tested: true,
        issues: [],
      },
      sgaeToCail: {
        implemented: false,
        tested: false,
        issues: [],
      },
    },
    nonFunctional: {
      performance: {
        loadTested: false,
        maxObservedResponseTimeMs: 800,
        targetResponseTimeMs: 1000,
      },
      security: {
        basicAuthImplemented: true,
        rolePermissionsTested: false,
      },
      logging: {
        auditTrailImplemented: true,
        errorLoggingImplemented: true,
      },
    },
  };

  it('scores engines, integration, and non-functional deterministically', () => {
    const out = evaluateOperationalReadiness(exampleInput);

    // TAE: 0.4*95 + 0.4*90 + 0.2*90 = 38+36+18 = 92
    expect(out.engineReadiness.find((e) => e.name === 'TAE')?.score).toBe(92);

    // SPCE: 0.4*100 + 0.4*0 + 0.2*100 = 40+0+20 = 60
    expect(out.engineReadiness.find((e) => e.name === 'SPCE')?.score).toBe(60);

    // Integration: 100 - 30 (sgaeToCail not implemented) = 70
    expect(out.integrationReadiness.score).toBe(70);
    expect(out.integrationReadiness.classification).toBe('NeedsAttention');

    // Non-functional: 100 - 15 (load) - 20 (roles) = 65
    expect(out.nonFunctionalReadiness.score).toBe(65);

    expect(out.overallLaunchReadinessScore).toBeGreaterThan(0);
    expect(out.overallLaunchReadinessScore).toBeLessThan(85);
    expect(out.overallRecommendation).toBe('NoGo');
    expect(out.nextSteps).toContain('Implement integration: sgaeToCail');
    expect(out.nextSteps).toContain(
      'Execute role permission tests across safety modules',
    );
  });

  it('flags High integration issues as blocking', () => {
    const out = evaluateOperationalReadiness({
      engines: [
        {
          name: 'SPCE',
          unitTestsPassRate: 1,
          integrationTestsPassRate: 1,
          knownIssues: [],
          testScenariosImplemented: [],
          testScenariosMissing: [],
        },
      ],
      integration: {
        spceToSgae: {
          implemented: true,
          tested: false,
          issues: [
            {
              id: 'INT-1',
              severity: 'High',
              description: 'Score mapping mismatch',
            },
          ],
        },
      },
      nonFunctional: {
        performance: { loadTested: true },
        security: { rolePermissionsTested: true },
        logging: {
          auditTrailImplemented: true,
          errorLoggingImplemented: true,
        },
      },
    });

    // Integration: 100 - 20 (not tested) - 20 (High issue) = 60
    expect(out.integrationReadiness.score).toBe(60);
    expect(out.topBlockingIssues).toHaveLength(1);
    expect(out.topBlockingIssues[0].id).toBe('INT-1');
    expect(out.overallRecommendation).toBe('NoGo');
  });

  it('returns Go when all dimensions are strong', () => {
    const out = evaluateOperationalReadiness({
      engines: [
        {
          name: 'TAE',
          unitTestsPassRate: 1,
          integrationTestsPassRate: 1,
          knownIssues: [],
          testScenariosImplemented: ['All'],
          testScenariosMissing: [],
        },
        {
          name: 'SPCE',
          unitTestsPassRate: 1,
          integrationTestsPassRate: 1,
          knownIssues: [],
          testScenariosImplemented: ['All'],
          testScenariosMissing: [],
        },
      ],
      integration: {
        taeToSpce: { implemented: true, tested: true, issues: [] },
        spceToSgae: { implemented: true, tested: true, issues: [] },
        sgaeToCail: { implemented: true, tested: true, issues: [] },
      },
      nonFunctional: {
        performance: {
          loadTested: true,
          maxObservedResponseTimeMs: 500,
          targetResponseTimeMs: 1000,
        },
        security: { rolePermissionsTested: true },
        logging: {
          auditTrailImplemented: true,
          errorLoggingImplemented: true,
        },
      },
    });

    expect(out.overallLaunchReadinessScore).toBeGreaterThanOrEqual(85);
    expect(out.overallRecommendation).toBe('Go');
    expect(out.topBlockingIssues).toHaveLength(0);
  });
});

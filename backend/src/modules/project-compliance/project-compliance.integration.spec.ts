import { ProjectComplianceAlertType } from '@prisma/client';
import { ProjectComplianceAlertsService } from './project-compliance-alerts.service';
import { ProjectComplianceService } from './project-compliance.service';

describe('Project compliance integration scenarios', () => {
  const now = new Date('2026-06-15T12:00:00.000Z');

  function buildPrismaMock(scenario: 'compliant' | 'mixed') {
    const project = {
      id: 1,
      name: 'Tower A',
      companyId: 10,
      client: 'Acme Corp',
    };

    const workers =
      scenario === 'compliant'
        ? [
            {
              workerId: 1,
              role: null,
              worker: { id: 1, firstName: 'A', lastName: 'One' },
            },
          ]
        : [
            {
              workerId: 1,
              role: 'worker',
              worker: { id: 1, firstName: 'A', lastName: 'One' },
            },
            {
              workerId: 2,
              role: 'supervisor',
              worker: { id: 2, firstName: 'B', lastName: 'Two' },
            },
          ];

    const rules =
      scenario === 'compliant'
        ? [
            {
              id: 1,
              ruleType: 'ALL_WORKERS' as const,
              requiredCredentialTypeId: 5,
              metadata: {},
              certification: { code: 'WHMIS', name: 'WHMIS' },
            },
          ]
        : [
            {
              id: 1,
              ruleType: 'ALL_WORKERS' as const,
              requiredCredentialTypeId: 5,
              metadata: {},
              certification: { code: 'WHMIS', name: 'WHMIS' },
            },
            {
              id: 2,
              ruleType: 'ROLE' as const,
              requiredCredentialTypeId: 6,
              metadata: { roles: ['supervisor'] },
              certification: { code: 'SUP', name: 'Supervisor Training' },
            },
          ];

    const trainingRecords =
      scenario === 'compliant'
        ? [
            {
              id: 100,
              workerId: 1,
              certificationId: 5,
              expiresAt: new Date('2027-01-01'),
              lastVerificationStatus: 'VERIFIED',
            },
          ]
        : [
            {
              id: 100,
              workerId: 1,
              certificationId: 5,
              expiresAt: new Date('2027-01-01'),
              lastVerificationStatus: 'VERIFIED',
            },
            {
              id: 101,
              workerId: 2,
              certificationId: 5,
              expiresAt: new Date('2027-01-01'),
              lastVerificationStatus: 'VERIFIED',
            },
          ];

    return {
      project: { findUnique: jest.fn().mockResolvedValue(project) },
      projectAssignment: {
        findMany: jest.fn().mockResolvedValue(workers),
        findFirst: jest.fn(),
      },
      projectComplianceRule: {
        findMany: jest.fn().mockResolvedValue(rules),
        create: jest.fn(),
      },
      trainingRecord: {
        findMany: jest.fn().mockResolvedValue(trainingRecords),
      },
      companyLink: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      pmWorkerSafetyProfile: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      projectComplianceAlert: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest
          .fn()
          .mockImplementation(({ data }) =>
            Promise.resolve({ id: 99, ...data, createdAt: now }),
          ),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };
  }

  it('returns 100% compliance when all workers satisfy rules', async () => {
    const prisma = buildPrismaMock('compliant');
    const compliance = new ProjectComplianceService(prisma as never);
    const report = await compliance.evaluateProject(1);
    expect(report.compliancePercentage).toBe(100);
    expect(report.nonCompliantWorkers).toHaveLength(0);
  });

  it('returns mixed compliance with supervisor-specific gap', async () => {
    const prisma = buildPrismaMock('mixed');
    const compliance = new ProjectComplianceService(prisma as never);
    const report = await compliance.evaluateProject(1);
    expect(report.compliancePercentage).toBe(50);
    expect(report.nonCompliantWorkers).toHaveLength(1);
    expect(report.nonCompliantWorkers[0]?.workerId).toBe(2);
    expect(
      report.nonCompliantWorkers[0]?.gaps.some(
        (g) => g.certificationName === 'Supervisor Training',
      ),
    ).toBe(true);
  });

  it('creates alerts when a newly assigned worker is non-compliant', async () => {
    const prisma = buildPrismaMock('mixed');
    const compliance = new ProjectComplianceService(prisma as never);
    const alerts = new ProjectComplianceAlertsService(
      prisma as never,
      compliance,
    );

    jest.spyOn(compliance, 'evaluateProject').mockResolvedValue({
      projectId: 1,
      projectName: 'Tower A',
      companyId: 10,
      client: null,
      compliancePercentage: 50,
      totalWorkers: 2,
      compliantWorkers: [],
      nonCompliantWorkers: [
        {
          workerId: 2,
          workerName: 'B Two',
          role: 'supervisor',
          trade: null,
          isCompliant: false,
          gaps: [
            {
              ruleId: 2,
              ruleType: 'ROLE',
              certificationId: 6,
              certificationCode: 'SUP',
              certificationName: 'Supervisor Training',
              status: 'missing',
              credentialId: null,
              expiresAt: null,
              reason: 'Missing required credential: Supervisor Training',
            },
          ],
          expiringSoon: [],
        },
      ],
      missingOrExpiring: [],
      evaluatedAt: now.toISOString(),
    });

    await alerts.onWorkerAssigned(1, 2);

    expect(prisma.projectComplianceAlert.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: 1,
          workerId: 2,
          type: ProjectComplianceAlertType.MISSING,
        }),
      }),
    );
  });
});

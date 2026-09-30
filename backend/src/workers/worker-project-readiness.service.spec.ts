import { ContractorComplianceEngineService } from '../pm-contractor-portal/contractor-compliance-engine.service';
import { OrientationAccessService } from '../modules/orientation/orientation-access.service';
import { WorkerTrainingHydrationService } from './worker-training-hydration.service';
import { WorkerProjectReadinessService } from './worker-project-readiness.service';

describe('WorkerProjectReadinessService', () => {
  const prisma = {
    project: { findUnique: jest.fn() },
    worker: { findUnique: jest.fn() },
    projectAssignment: { findFirst: jest.fn() },
    companyLink: { findFirst: jest.fn() },
    pmProjectSafetyProfile: { findFirst: jest.fn() },
    siteAccessRule: { findUnique: jest.fn() },
    safetyForm: { findFirst: jest.fn() },
    pmContractorPortalMembership: { findFirst: jest.fn() },
    pmCompanyTrainingMatrix: { findMany: jest.fn() },
  };

  const trainingHydration = {
    hydrateWorkerTraining: jest.fn(),
  };

  const orientationAccess = {
    evaluateWorker: jest.fn(),
  };

  const contractorCompliance = {
    buildInputFromMembership: jest.fn(),
    generate: jest.fn(),
  };

  const service = new WorkerProjectReadinessService(
    prisma as never,
    trainingHydration as never,
    orientationAccess as never,
    contractorCompliance as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns READY when all requirements are verified', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 1,
      name: 'Site A',
      companyId: 10,
    });
    prisma.worker.findUnique.mockResolvedValue({
      id: 5,
      firstName: 'Alex',
      lastName: 'Rivera',
      companyId: 10,
      company: { id: 10, name: 'Prime Co' },
      trainingRecords: [
        {
          id: 100,
          expiresAt: new Date('2027-01-01'),
          lastVerificationStatus: 'VERIFIED',
          certification: { code: 'WHMIS', name: 'WHMIS' },
        },
      ],
    });
    prisma.projectAssignment.findFirst.mockResolvedValue(null);
    prisma.companyLink.findFirst.mockResolvedValue({ role: 'worker' });
    prisma.pmProjectSafetyProfile.findFirst.mockResolvedValue({
      requiredTraining: ['WHMIS'],
    });
    prisma.siteAccessRule.findUnique.mockResolvedValue(null);
    orientationAccess.evaluateWorker.mockResolvedValue({
      allowed: true,
      blockingPackages: [],
    });
    prisma.safetyForm.findFirst.mockResolvedValue({ id: 'form-1' });
    prisma.pmCompanyTrainingMatrix.findMany.mockResolvedValue([]);

    trainingHydration.hydrateWorkerTraining.mockResolvedValue({
      requirements: [
        {
          code: 'WHMIS',
          name: 'WHMIS',
          status: 'valid',
          matchedRecordId: 100,
          expiresAt: '2027-01-01',
        },
      ],
      restrictions: [],
      summary: { hasBlockingRestrictions: false },
    });

    const result = await service.evaluate(5, 1);

    expect(result.status).toBe('READY');
    expect(result.blocking_items).toHaveLength(0);
    expect(result.supervisor_message).toContain('cleared for work');
  });

  it('returns NOT QUALIFIED when required training is missing', async () => {
    prisma.project.findUnique.mockResolvedValue({
      id: 2,
      name: 'Site B',
      companyId: 10,
    });
    prisma.worker.findUnique.mockResolvedValue({
      id: 6,
      firstName: 'Sam',
      lastName: 'Lee',
      companyId: 20,
      company: { id: 20, name: 'Sub Co' },
      trainingRecords: [],
    });
    prisma.projectAssignment.findFirst.mockResolvedValue(null);
    prisma.companyLink.findFirst.mockResolvedValue({ role: 'worker' });
    prisma.pmProjectSafetyProfile.findFirst.mockResolvedValue({
      requiredTraining: ['Fall protection'],
    });
    prisma.siteAccessRule.findUnique.mockResolvedValue(null);
    orientationAccess.evaluateWorker.mockResolvedValue({
      allowed: false,
      blockingPackages: [{ title: 'Site orientation', status: 'pending' }],
    });
    prisma.safetyForm.findFirst.mockResolvedValue(null);
    prisma.pmContractorPortalMembership.findFirst.mockResolvedValue({
      id: 'mem-1',
    });
    contractorCompliance.buildInputFromMembership.mockResolvedValue({});
    contractorCompliance.generate.mockReturnValue({
      approval_status: 'reject',
    });
    prisma.pmCompanyTrainingMatrix.findMany.mockResolvedValue([]);

    trainingHydration.hydrateWorkerTraining.mockResolvedValue({
      requirements: [
        {
          code: 'Fall protection',
          name: 'Fall protection',
          status: 'missing',
          matchedRecordId: null,
          expiresAt: null,
        },
      ],
      restrictions: [],
      summary: { hasBlockingRestrictions: false },
    });

    const result = await service.evaluate(6, 2);

    expect(result.status).toBe('NOT QUALIFIED');
    expect(result.blocking_items.length).toBeGreaterThan(0);
    expect(result.fix_steps.length).toBeGreaterThan(0);
    expect(result.contractor_prequalification.status).toBe('rejected');
  });
});

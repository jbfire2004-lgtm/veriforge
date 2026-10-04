import { NotFoundException } from '@nestjs/common';
import { FieldOfflineBundleService } from './field-offline-bundle.service';

describe('FieldOfflineBundleService', () => {
  const prisma = {
    worker: { findUnique: jest.fn() },
    projectAssignment: { findMany: jest.fn() },
    project: { findMany: jest.fn() },
    safetyForm: { findMany: jest.fn() },
    trainingRecord: { findMany: jest.fn() },
    safetyFormDefinition: { findMany: jest.fn() },
    safetyFormTemplate: { findMany: jest.fn() },
  };

  let service: FieldOfflineBundleService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FieldOfflineBundleService(prisma as never);
  });

  it('throws when worker is missing', async () => {
    prisma.worker.findUnique.mockResolvedValue(null);
    await expect(service.fetchBundle({ workerId: 99 })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('returns worker-scoped bundle with safety forms and credentials', async () => {
    prisma.worker.findUnique.mockResolvedValue({
      id: 5,
      firstName: 'Alex',
      lastName: 'River',
      email: 'alex@example.com',
      phone: null,
      qrToken: 'w-token',
      status: 'ACTIVE',
      companyId: 1,
      userId: 10,
    });
    prisma.projectAssignment.findMany
      .mockResolvedValueOnce([
        {
          projectId: 7,
          workerId: 5,
          companyId: 1,
          status: 'ACTIVE',
          project: {
            id: 7,
            name: 'Site A',
            code: 'SA',
            status: 'ACTIVE',
            companyId: 1,
            startDate: null,
            endDate: null,
          },
        },
      ])
      .mockResolvedValueOnce([{ workerId: 5 }, { workerId: 8 }]);
    prisma.project.findMany.mockResolvedValue([
      {
        id: 7,
        name: 'Site A',
        code: 'SA',
        status: 'ACTIVE',
        companyId: 1,
        startDate: null,
        endDate: null,
      },
    ]);
    prisma.safetyForm.findMany.mockResolvedValue([
      { id: 'form-1', projectId: 7, workerId: 5, status: 'DRAFT' },
    ]);
    prisma.trainingRecord.findMany.mockResolvedValue([
      {
        id: 100,
        workerId: 5,
        certificateQrToken: 'cert_abc',
        lastVerificationStatus: 'VERIFIED',
      },
    ]);
    prisma.safetyFormDefinition.findMany.mockResolvedValue([
      { id: 'jha', name: 'JHA', category: 'safety', version: 1 },
    ]);
    prisma.safetyFormTemplate.findMany.mockResolvedValue([]);

    const bundle = await service.fetchBundle({ companyId: 1, workerId: 5 });

    expect(bundle.worker).toMatchObject({ id: 5, firstName: 'Alex' });
    expect(bundle.projects).toHaveLength(1);
    expect(bundle.safetyForms).toHaveLength(1);
    expect(bundle.credentials).toHaveLength(1);
    expect(bundle.safetyFormDefinitions).toHaveLength(1);
    expect(bundle.syncedAt).toBeTruthy();
  });
});

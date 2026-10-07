import { Test } from '@nestjs/testing';
import { FieldSyncBatchProcessor } from './field-sync-batch.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { CompanyLinksService } from '../vera-core/company-links.service';
import { ProjectsService } from '../vera-core/projects.service';
import { EquipmentLinksService } from '../vera-core/equipment-links.service';
import { TrainingRecordsService } from '../../training-records/training-records.service';
import { PmSafetyWorkflowService } from '../../pm-safety-workflow/pm-safety-workflow.service';

describe('FieldSyncBatchProcessor', () => {
  let processor: FieldSyncBatchProcessor;

  const prisma = {
    project: { findUnique: jest.fn() },
    inspection: { create: jest.fn() },
    trainingValidationResult: { create: jest.fn() },
    projectAssignment: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FieldSyncBatchProcessor,
        { provide: PrismaService, useValue: prisma },
        {
          provide: CompanyLinksService,
          useValue: { linkWorker: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: ProjectsService,
          useValue: {
            assignWorker: jest.fn().mockResolvedValue({}),
            assignEquipment: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: EquipmentLinksService,
          useValue: { linkEquipment: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: TrainingRecordsService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 1, workerId: 2 }),
          },
        },
        {
          provide: PmSafetyWorkflowService,
          useValue: {
            create: jest.fn().mockResolvedValue({
              id: 9,
              status: 'DRAFT',
              updatedAt: new Date(),
            }),
            transition: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = moduleRef.get(FieldSyncBatchProcessor);
  });

  it('accepts qr.tempRecord', async () => {
    const res = await processor.processOne(
      { type: 'qr.tempRecord', payload: { tempId: 'x' } },
      1,
    );
    expect(res.ok).toBe(true);
  });
});

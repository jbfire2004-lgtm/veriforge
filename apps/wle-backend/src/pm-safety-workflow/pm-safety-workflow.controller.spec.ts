import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PmSafetyWorkflowController } from './pm-safety-workflow.controller';
import { PmSafetyWorkflowService } from './pm-safety-workflow.service';

describe('PmSafetyWorkflowController (mocked service)', () => {
  let controller: PmSafetyWorkflowController;
  const pmSafety = {
    getDefinition: jest.fn().mockReturnValue({ version: 1 }),
    list: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 1 }),
    findOne: jest.fn().mockResolvedValue({ id: 1 }),
    getState: jest
      .fn()
      .mockResolvedValue({ workflow: {}, availableActions: [] }),
    transition: jest.fn().mockResolvedValue({ id: 1, status: 'SUBMITTED' }),
    listEvents: jest.fn().mockResolvedValue([]),
    exportPdfBuffer: jest
      .fn()
      .mockResolvedValue(Buffer.from('%PDF-1.4\n%%EOF\n', 'utf8')),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PmSafetyWorkflowController],
      providers: [{ provide: PmSafetyWorkflowService, useValue: pmSafety }],
    }).compile();

    controller = module.get(PmSafetyWorkflowController);
  });

  it('definition delegates to service', () => {
    expect(controller.definition()).toEqual({ version: 1 });
    expect(pmSafety.getDefinition).toHaveBeenCalledTimes(1);
  });

  it('list passes parsed companyId and whitelisted status', async () => {
    await controller.list('7', 'APPROVED');
    expect(pmSafety.list).toHaveBeenCalledWith({
      companyId: 7,
      status: 'APPROVED',
    });
  });

  it('list omits companyId when query empty', async () => {
    await controller.list(undefined, 'DRAFT');
    expect(pmSafety.list).toHaveBeenCalledWith({
      companyId: undefined,
      status: 'DRAFT',
    });
  });

  it('list ignores unknown status string', async () => {
    await controller.list(undefined, 'NOT_A_REAL_STATUS');
    expect(pmSafety.list).toHaveBeenCalledWith({
      companyId: undefined,
      status: undefined,
    });
  });

  it('create forwards body', async () => {
    const dto = { title: 'T', kind: 'JOB_SAFETY_ANALYSIS' as const };
    await controller.create(dto as never);
    expect(pmSafety.create).toHaveBeenCalledWith(dto);
  });

  it('findOne parses id', async () => {
    await controller.findOne(42);
    expect(pmSafety.findOne).toHaveBeenCalledWith(42);
  });

  it('transition forwards action, actor, and note', async () => {
    await (
      controller as unknown as {
        transition(
          id: number,
          dto: { action: string; note?: string },
          actorUserId: string,
          actorRole: string,
        ): Promise<unknown>;
      }
    ).transition(3, { action: 'submit', note: 'ok' }, '99', 'PROJECT_MANAGER');
    expect(pmSafety.transition).toHaveBeenCalledWith(
      3,
      'submit',
      { userId: 99, role: 'PROJECT_MANAGER' },
      'ok',
    );
  });

  it('exportPdf returns StreamableFile from buffer', async () => {
    const out = await controller.exportPdf(9);
    expect(pmSafety.exportPdfBuffer).toHaveBeenCalledWith(9);
    expect(out).toBeInstanceOf(StreamableFile);
  });
});

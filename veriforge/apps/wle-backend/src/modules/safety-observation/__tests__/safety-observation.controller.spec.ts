import { Test, TestingModule } from '@nestjs/testing';
import { SafetyObservationController } from '../safety-observation.controller';
import { SafetyObservationService } from '../safety-observation.service';

describe('SafetyObservationController', () => {
  let controller: SafetyObservationController;
  const svc = {
    findAll: jest
      .fn()
      .mockResolvedValue({ items: [], total: 0, skip: 0, take: 50 }),
    findOne: jest.fn(),
    create: jest.fn().mockResolvedValue({ id: 1 }),
    update: jest.fn(),
    remove: jest.fn().mockResolvedValue({ id: 1, deleted: true }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SafetyObservationController],
      providers: [{ provide: SafetyObservationService, useValue: svc }],
    }).compile();

    controller = module.get(SafetyObservationController);
  });

  it('list forwards query', async () => {
    await controller.list({
      companyId: 2,
      siteId: 3,
      skip: 0,
      take: 10,
    } as never);
    expect(svc.findAll).toHaveBeenCalledWith({
      companyId: 2,
      siteId: 3,
      status: undefined,
      severity: undefined,
      skip: 0,
      take: 10,
    });
  });

  it('create forwards body', async () => {
    const dto = {
      title: 'Near miss',
      observedAt: '2026-05-01T08:00:00.000Z',
    };
    await controller.create(dto as never);
    expect(svc.create).toHaveBeenCalledWith(dto);
  });

  it('findOne parses id', async () => {
    await controller.findOne(7);
    expect(svc.findOne).toHaveBeenCalledWith(7);
  });
});

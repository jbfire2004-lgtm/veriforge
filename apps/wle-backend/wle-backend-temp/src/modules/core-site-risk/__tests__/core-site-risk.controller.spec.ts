import { Test, TestingModule } from '@nestjs/testing';
import { CoreSiteRiskController } from '../core-site-risk.controller';
import { CoreSiteRiskService } from '../core-site-risk.service';

describe('CoreSiteRiskController', () => {
  let controller: CoreSiteRiskController;
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
      controllers: [CoreSiteRiskController],
      providers: [{ provide: CoreSiteRiskService, useValue: svc }],
    }).compile();

    controller = module.get(CoreSiteRiskController);
  });

  it('list forwards query', async () => {
    await controller.list({
      companyId: 2,
      siteId: 3,
      category: undefined,
      skip: 0,
      take: 10,
    } as never);
    expect(svc.findAll).toHaveBeenCalledWith({
      companyId: 2,
      siteId: 3,
      status: undefined,
      category: undefined,
      severity: undefined,
      skip: 0,
      take: 10,
    });
  });

  it('create forwards body', async () => {
    const dto = {
      title: 'Cable tray',
      identifiedAt: '2026-05-01T08:00:00.000Z',
    };
    await controller.create(dto as never);
    expect(svc.create).toHaveBeenCalledWith(dto);
  });
});

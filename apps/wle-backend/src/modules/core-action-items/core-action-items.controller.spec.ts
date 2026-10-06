import { Test, TestingModule } from '@nestjs/testing';
import { CoreActionItemsController } from './core-action-items.controller';
import { CoreActionItemsService } from './core-action-items.service';

describe('CoreActionItemsController', () => {
  let controller: CoreActionItemsController;
  const svc = {
    findAll: jest
      .fn()
      .mockResolvedValue({ items: [], total: 0, skip: 0, take: 50 }),
    findOne: jest.fn(),
    create: jest.fn().mockResolvedValue({ id: 'x' }),
    update: jest.fn(),
    remove: jest.fn().mockResolvedValue({ id: 'x', deleted: true }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoreActionItemsController],
      providers: [{ provide: CoreActionItemsService, useValue: svc }],
    }).compile();

    controller = module.get(CoreActionItemsController);
  });

  it('list forwards query', async () => {
    await controller.list({
      companyId: 2,
      status: 'OPEN',
      skip: 0,
      take: 10,
    } as never);
    expect(svc.findAll).toHaveBeenCalledWith({
      companyId: 2,
      status: 'OPEN',
      skip: 0,
      take: 10,
    });
  });

  it('create forwards body', async () => {
    const dto = { title: 'T' };
    await controller.create(dto as never);
    expect(svc.create).toHaveBeenCalledWith(dto);
  });
});

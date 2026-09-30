import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TenantScopeService } from '../../../security/tenant-scope.service';
import { VsiCopilotController } from './vsi-copilot.controller';
import { VsiCopilotEngineService } from './vsi-copilot-engine.service';

describe('VsiCopilotController JWT tenant assert', () => {
  let controller: VsiCopilotController;
  let copilot: { run: jest.Mock };

  beforeEach(async () => {
    copilot = {
      run: jest.fn().mockResolvedValue({
        module: 'inspection',
        engine: ['copilot-heuristic'],
        output: {},
        cailEnvelope: {},
        generatedAt: new Date().toISOString(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VsiCopilotController,
        TenantScopeService,
        { provide: PrismaService, useValue: {} },
        { provide: VsiCopilotEngineService, useValue: copilot },
      ],
    }).compile();

    controller = module.get(VsiCopilotController);
  });

  it('binds companyId from JWT for non-admins (ignores body spoof)', async () => {
    await controller.run(
      {
        user: {
          id: 9,
          role: UserRole.SUPERVISOR,
          companyId: 12,
        },
      },
      {
        module: 'inspection',
        companyId: 999,
        context: { caption: 'missing hard hat' },
      },
    );

    expect(copilot.run).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 12,
        actor: expect.objectContaining({
          userId: 9,
          role: UserRole.SUPERVISOR,
          companyId: 12,
        }),
      }),
    );
  });

  it('uses JWT companyId when body omits companyId', async () => {
    await controller.run(
      {
        user: {
          id: 3,
          role: UserRole.WORKER,
          companyId: 44,
        },
      },
      {
        module: 'bbo',
        context: { note: 'x' },
      },
    );

    expect(copilot.run).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: 44 }),
    );
  });

  it('allows SUPER_ADMIN to target explicit body companyId', async () => {
    await controller.run(
      {
        user: {
          id: 1,
          role: UserRole.SUPER_ADMIN,
          companyId: 1,
        },
      },
      {
        module: 'presentation',
        companyId: 77,
        context: {},
      },
    );

    expect(copilot.run).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: 77 }),
    );
  });

  it('rejects users with no company tenant', () => {
    expect(() =>
      controller.run(
        {
          user: {
            id: 8,
            role: UserRole.WORKER,
            companyId: null,
          },
        },
        {
          module: 'inspection',
          context: {},
        },
      ),
    ).toThrow(ForbiddenException);
    expect(copilot.run).not.toHaveBeenCalled();
  });
});

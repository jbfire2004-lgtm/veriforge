import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService refresh security', () => {
  const prisma = {
    refreshToken: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    trainingInstructor: { findFirst: jest.fn() },
    user: { findUnique: jest.fn() },
    worker: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };
  const jwt = { sign: jest.fn(() => 'signed-access-token') };
  const monitoring = {
    warn: jest.fn(),
    processing: jest.fn(),
    persistAudit: jest.fn(),
  };

  const service = new AuthService(
    prisma as never,
    jwt as never,
    monitoring as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.trainingInstructor.findFirst.mockResolvedValue(null);
    prisma.user.findUnique.mockResolvedValue({
      companyId: 12,
      company: { name: 'Acme' },
    });
    prisma.worker.findFirst.mockResolvedValue(null);
  });

  it('rejects refresh for deactivated users', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 10,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: 7,
        username: 'worker',
        email: 'worker@vera.test',
        role: UserRole.WORKER,
        active: false,
        companyId: 12,
        trainingProviderId: null,
      },
    });

    await expect(service.refresh('refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(monitoring.warn).toHaveBeenCalledWith('auth', 'refresh.failed', {
      reason: 'user_deactivated',
      userId: 7,
    });
  });

  it('rejects replayed refresh tokens when rotation race occurs', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 11,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: 8,
        username: 'supervisor',
        email: 'supervisor@vera.test',
        role: UserRole.SUPERVISOR,
        active: true,
        companyId: 13,
        trainingProviderId: null,
      },
    });
    prisma.$transaction.mockImplementation(
      async (cb: (tx: unknown) => unknown) =>
        cb({
          refreshToken: {
            updateMany: async () => ({ count: 0 }),
            create: async () => ({}),
          },
        }),
    );

    await expect(service.refresh('refresh-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(monitoring.warn).toHaveBeenCalledWith('auth', 'refresh.failed', {
      reason: 'token_replay',
      userId: 8,
    });
  });

  it('rotates refresh token and returns new session for valid request', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 12,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: {
        id: 9,
        username: 'instructor',
        email: 'instructor@vera.test',
        role: UserRole.TRAINING_INSTRUCTOR,
        active: true,
        companyId: null,
        trainingProviderId: 22,
      },
    });
    prisma.trainingInstructor.findFirst.mockResolvedValue({ id: 81 });
    prisma.$transaction.mockImplementation(
      async (cb: (tx: unknown) => unknown) =>
        cb({
          refreshToken: {
            updateMany: async () => ({ count: 1 }),
            create: async () => ({ id: 100 }),
          },
        }),
    );

    const result = await service.refresh('refresh-token');
    expect(result.accessToken).toBe('signed-access-token');
    expect(result.refreshToken).toBeTruthy();
    expect(result.refreshToken).not.toBe('refresh-token');
    expect(result.user.id).toBe(9);
    expect(result.user.instructorId).toBe(81);
    expect(monitoring.persistAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'auth.refresh.success',
        userId: 9,
      }),
    );
  });
});

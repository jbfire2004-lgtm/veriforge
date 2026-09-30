import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { authService } from '../../src/services/auth.service';
import { userRepository } from '../../src/models/user.repository';
import { refreshTokenRepository } from '../../src/models/refresh-token.repository';

vi.mock('../../src/models/user.repository', () => ({
  userRepository: {
    findByCompanyAndEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    updateRoles: vi.fn(),
  },
}));

vi.mock('../../src/models/refresh-token.repository', () => ({
  refreshTokenRepository: {
    create: vi.fn(),
    findByHash: vi.fn(),
    revoke: vi.fn(),
    revokeAllForUser: vi.fn(),
  },
}));

vi.mock('../../src/services/rbac-hook.service', () => ({
  notifyRbacOnRegister: vi.fn(async (u: { roles: string[] }) => u.roles),
}));

const companyId = '22222222-2222-2222-2222-222222222222';
const userId = '11111111-1111-1111-1111-111111111111';

function mockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: userId,
    companyId,
    email: 'user@example.com',
    passwordHash: bcrypt.hashSync('password123', 4),
    firstName: 'Test',
    lastName: 'User',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [{ role: 'worker' }],
    ...overrides,
  };
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login rejects wrong company', async () => {
    vi.mocked(userRepository.findByCompanyAndEmail).mockResolvedValue(null);
    await expect(
      authService.login({
        companyId,
        email: 'user@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('login succeeds with valid credentials', async () => {
    const user = mockUser();
    vi.mocked(userRepository.findByCompanyAndEmail).mockResolvedValue(user as never);
    vi.mocked(refreshTokenRepository.create).mockResolvedValue({} as never);

    const result = await authService.login({
      companyId,
      email: 'user@example.com',
      password: 'password123',
    });

    expect(result.user.id).toBe(userId);
    expect(result.tokens.accessToken).toBeTruthy();
    expect(result.tokens.refreshToken).toBeTruthy();
  });

  it('validateAccessToken returns invalid for garbage', () => {
    const result = authService.validateAccessToken('not-a-jwt');
    expect(result.valid).toBe(false);
  });
});

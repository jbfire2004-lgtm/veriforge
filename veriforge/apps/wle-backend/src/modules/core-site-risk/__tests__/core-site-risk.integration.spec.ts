/**
 * Lightweight integration-style test: in-memory mock Prisma state across calls.
 */
import { CoreSiteRiskService } from '../core-site-risk.service';
import {
  CoreSiteRiskCategory,
  CoreSiteRiskSeverity,
  CoreSiteRiskStatus,
} from '@prisma/client';

describe('CoreSiteRiskService (integration-style)', () => {
  let service: CoreSiteRiskService;
  let nextId: number;
  const rows: Map<number, object> = new Map();

  const prisma = {
    company: {
      findUnique: jest.fn(({ where: { id } }: { where: { id: number } }) =>
        id === 1 ? Promise.resolve({ id: 1 }) : Promise.resolve(null),
      ),
    },
    site: {
      findUnique: jest.fn(() => Promise.resolve(null)),
    },
    user: {
      findUnique: jest.fn(() => Promise.resolve(null)),
    },
    coreSiteRisk: {
      create: jest.fn(({ data }: { data: object }) => {
        const id = nextId++;
        const row = {
          id,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          company: null,
          site: null,
          owner: null,
        };
        rows.set(id, row);
        return Promise.resolve(row);
      }),
      findUnique: jest.fn(({ where: { id } }: { where: { id: number } }) =>
        Promise.resolve(rows.get(id) ?? null),
      ),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops as [])),
  };

  beforeEach(() => {
    nextId = 1;
    rows.clear();
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((ops: unknown[]) =>
      Promise.all(ops as []),
    );
    service = new CoreSiteRiskService(prisma as never);
  });

  it('create then findOne returns persisted row', async () => {
    const created = await service.create({
      title: 'Guard missing',
      identifiedAt: '2026-06-01T10:00:00.000Z',
      category: CoreSiteRiskCategory.STRUCTURAL,
      severity: CoreSiteRiskSeverity.MEDIUM,
      status: CoreSiteRiskStatus.OPEN,
    });
    const got = await service.findOne(created.id);
    expect(got.title).toBe('Guard missing');
    expect(got.category).toBe(CoreSiteRiskCategory.STRUCTURAL);
  });
});

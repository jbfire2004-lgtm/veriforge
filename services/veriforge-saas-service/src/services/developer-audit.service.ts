import { prisma } from '../db/prisma';
import { asJson } from '../utils/json';

const SENSITIVE = /password|secret|token|authorization|keyHash/i;

function scrub(meta?: Record<string, unknown>) {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    out[k] = SENSITIVE.test(k) ? '[redacted]' : v;
  }
  return out;
}

export class DeveloperAuditService {
  async log(input: {
    developerId?: string | null;
    action: string;
    resource?: string;
    resourceId?: string;
    ip?: string;
    userAgent?: string;
    meta?: Record<string, unknown>;
  }) {
    await prisma.developerActionLog.create({
      data: {
        developerId: input.developerId ?? null,
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        ip: input.ip,
        userAgent: input.userAgent,
        meta: asJson(scrub(input.meta)),
      },
    });
  }

  async list(opts?: {
    skip?: number;
    take?: number;
    action?: string;
    developerId?: string;
  }) {
    const skip = opts?.skip ?? 0;
    const take = Math.min(opts?.take ?? 100, 500);
    const where = {
      ...(opts?.action ? { action: opts.action } : {}),
      ...(opts?.developerId ? { developerId: opts.developerId } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.developerActionLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          developer: { select: { id: true, email: true, role: true } },
        },
      }),
      prisma.developerActionLog.count({ where }),
    ]);
    return { items, total, skip, take };
  }
}

export const developerAudit = new DeveloperAuditService();

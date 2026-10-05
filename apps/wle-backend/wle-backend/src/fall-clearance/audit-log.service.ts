import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CalculationResultDto,
  ConfigurationInstanceDto,
} from './dto/configuration-instance.dto';

export type FallClearanceAuditEntry = {
  id: string;
  configId: string | null;
  resultId: string | null;
  userId: string | null;
  siteId: string | null;
  projectId: string | null;
  payload: Prisma.JsonValue | null;
  createdAt: string;
};

export type AuditListFilter = {
  siteId?: string;
  projectId?: string;
  equipmentId?: string;
  from?: string;
  to?: string;
  limit?: number;
};

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * INSERT INTO clearance_audit_logs (config_id, result_id, user_id, site_id, project_id, payload, ...)
   */
  async logCalculation(
    config: ConfigurationInstanceDto,
    result: CalculationResultDto,
    userId?: string,
  ): Promise<FallClearanceAuditEntry> {
    const row = await this.prisma.fallClearanceAuditLog.create({
      data: {
        configId: result.configId,
        resultId: result.id,
        userId: isUuid(userId) ? userId! : null,
        siteId: config.siteId ?? null,
        projectId: config.projectId ?? null,
        payload: {
          equipmentId: config.equipmentId,
          actorUserId: userId ?? null,
          config,
          result,
        } as unknown as Prisma.InputJsonValue,
      },
    });
    return this.toEntry(row);
  }

  /**
   * SELECT ... FROM clearance_audit_logs WHERE ...
   * equipmentId is matched via payload->>'equipmentId' when provided.
   */
  async list(filters: AuditListFilter): Promise<FallClearanceAuditEntry[]> {
    const from = filters.from ? new Date(filters.from) : undefined;
    const to = filters.to ? new Date(filters.to) : undefined;
    const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);

    const rows = await this.prisma.fallClearanceAuditLog.findMany({
      where: {
        ...(filters.siteId ? { siteId: filters.siteId } : {}),
        ...(filters.projectId ? { projectId: filters.projectId } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from && !Number.isNaN(from.getTime()) ? { gte: from } : {}),
                ...(to && !Number.isNaN(to.getTime()) ? { lte: to } : {}),
              },
            }
          : {}),
        ...(filters.equipmentId
          ? {
              payload: {
                path: ['equipmentId'],
                equals: filters.equipmentId,
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return rows.map((r) => this.toEntry(r));
  }

  private toEntry(row: {
    id: string;
    configId: string | null;
    resultId: string | null;
    userId: string | null;
    siteId: string | null;
    projectId: string | null;
    payload: Prisma.JsonValue | null;
    createdAt: Date;
  }): FallClearanceAuditEntry {
    return {
      id: row.id,
      configId: row.configId,
      resultId: row.resultId,
      userId: row.userId,
      siteId: row.siteId,
      projectId: row.projectId,
      payload: row.payload,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

function isUuid(value?: string): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CoreDailyLogShift, Prisma } from '@prisma/client';
import { clampCoreCrudTake } from '../../common/constants/core-crud-list.constants';
import { PrismaService } from '../../prisma/prisma.service';
import type { CoreDailyLogSummary } from './entities/core-daily-log.entity';
import {
  CORE_DAILY_LOG_LIST_SORT_FIELDS,
  type CoreDailyLogListSortField,
} from './dto/list-core-daily-log.query.dto';
import { CreateCoreDailyLogDto } from './dto/create-core-daily-log.dto';
import { UpdateCoreDailyLogDto } from './dto/update-core-daily-log.dto';
import { toDailyLogRecord } from './daily-log.schema';

export type SummarizeCoreDailyLogParams = {
  companyId?: number;
  siteId?: number;
  logDateFrom?: string;
  logDateTo?: string;
};

export type ListCoreDailyLogQuery = {
  companyId?: number;
  siteId?: number;
  shift?: CoreDailyLogShift;
  skip?: number;
  take?: number;
  sortBy?: CoreDailyLogListSortField;
  sortOrder?: 'asc' | 'desc';
};

const includeRelations = {
  company: { select: { id: true, name: true } as const },
  site: { select: { id: true, name: true, code: true } as const },
  createdBy: { select: { id: true, username: true, email: true } as const },
  supervisor: { select: { id: true, username: true, email: true } as const },
  attachments: {
    include: {
      coreFile: {
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          publicUrl: true,
          purpose: true,
        },
      },
    },
  },
} as const;

function normalizeCreateInput(dto: CreateCoreDailyLogDto) {
  const companyId = dto.companyId ?? dto.company_id;
  const siteId = dto.siteId ?? dto.site_id;
  const supervisorUserId = dto.supervisorUserId ?? dto.supervisor;
  const safetyNotes = dto.safetyNotes ?? dto.safety_notes;
  const activities = dto.activities ?? dto.body;
  const logDateRaw = dto.logDate ?? dto.date;
  const attachmentFileIds = dto.attachmentFileIds ?? dto.attachments ?? [];
  return {
    companyId,
    siteId,
    supervisorUserId,
    safetyNotes,
    activities,
    logDateRaw,
    attachmentFileIds,
    title: dto.title,
    body: dto.body,
    shift: dto.shift,
    createdByUserId: dto.createdByUserId,
  };
}

function deriveTitle(
  title: string | undefined,
  activities: string | null | undefined,
): string {
  const t = title?.trim();
  if (t) return t;
  const act = activities?.trim();
  if (act) {
    const first = act.split(/\r?\n/)[0]!.trim();
    return first.slice(0, 500) || 'Daily log';
  }
  return 'Daily log';
}

@Injectable()
export class CoreDailyLogService {
  constructor(private readonly prisma: PrismaService) {}

  private mapRow<T extends Parameters<typeof toDailyLogRecord>[0]>(row: T) {
    const schema = toDailyLogRecord(row);
    return {
      ...row,
      ...schema,
      // Legacy camelCase aliases
      id: row.id,
      companyId: row.companyId,
      siteId: row.siteId,
      logDate:
        typeof row.logDate === 'string'
          ? row.logDate
          : row.logDate.toISOString(),
      activities: schema.activities,
      safetyNotes: schema.safety_notes,
      supervisorUserId: schema.supervisor?.id ?? null,
      body: row.body ?? schema.activities,
    };
  }

  private async assertUser(id: number, label: string) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) {
      throw new HttpException(`${label} does not exist`, HttpStatus.BAD_REQUEST);
    }
  }

  private async assertAttachmentFiles(ids: number[]) {
    if (ids.length === 0) return;
    const unique = [...new Set(ids)];
    const files = await this.prisma.coreFile.findMany({
      where: { id: { in: unique } },
      select: { id: true },
    });
    if (files.length !== unique.length) {
      throw new HttpException(
        'One or more attachment CoreFile ids do not exist',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(dto: CreateCoreDailyLogDto) {
    const n = normalizeCreateInput(dto);
    const activities = n.activities?.trim() || null;
    const safetyNotes = n.safetyNotes?.trim() || null;
    const title = deriveTitle(n.title, activities);

    if (!n.logDateRaw) {
      throw new HttpException(
        'date / logDate is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const logDate = new Date(n.logDateRaw);
    if (Number.isNaN(logDate.getTime())) {
      throw new HttpException(
        'date must be a valid ISO-8601 date or datetime',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (n.companyId != null) {
      const c = await this.prisma.company.findUnique({
        where: { id: n.companyId },
      });
      if (!c) {
        throw new HttpException(
          'company_id does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (n.siteId != null) {
      const s = await this.prisma.site.findUnique({ where: { id: n.siteId } });
      if (!s) {
        throw new HttpException(
          'site_id does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (n.createdByUserId != null) {
      await this.assertUser(n.createdByUserId, 'createdByUserId');
    }
    if (n.supervisorUserId != null) {
      await this.assertUser(n.supervisorUserId, 'supervisor');
    }
    await this.assertAttachmentFiles(n.attachmentFileIds);

    const row = await this.prisma.coreDailyLog.create({
      data: {
        title,
        body: n.body?.trim() ?? activities,
        activities,
        safetyNotes,
        logDate,
        shift: n.shift ?? CoreDailyLogShift.DAY,
        companyId: n.companyId ?? null,
        siteId: n.siteId ?? null,
        createdByUserId: n.createdByUserId ?? null,
        supervisorUserId: n.supervisorUserId ?? null,
        attachments:
          n.attachmentFileIds.length > 0
            ? {
                create: n.attachmentFileIds.map((coreFileId) => ({
                  coreFileId,
                })),
              }
            : undefined,
      },
      include: includeRelations,
    });

    return this.mapRow(row);
  }

  async findAll(query: ListCoreDailyLogQuery) {
    const take = clampCoreCrudTake(query.take);
    const skip = query.skip ?? 0;

    const where: {
      companyId?: number;
      siteId?: number;
      shift?: CoreDailyLogShift;
    } = {};

    if (query.companyId != null) where.companyId = query.companyId;
    if (query.siteId != null) where.siteId = query.siteId;
    if (query.shift != null) where.shift = query.shift;

    const sortBy: CoreDailyLogListSortField =
      query.sortBy != null &&
      (CORE_DAILY_LOG_LIST_SORT_FIELDS as readonly string[]).includes(
        query.sortBy,
      )
        ? query.sortBy
        : 'logDate';
    const sortOrder: 'asc' | 'desc' =
      query.sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy: Prisma.CoreDailyLogOrderByWithRelationInput[] =
      sortBy === 'logDate'
        ? [{ logDate: sortOrder }, { id: sortOrder === 'asc' ? 'asc' : 'desc' }]
        : [{ [sortBy]: sortOrder }, { id: 'desc' }];

    const [items, total] = await this.prisma.$transaction([
      this.prisma.coreDailyLog.findMany({
        where,
        orderBy,
        skip,
        take,
        include: includeRelations,
      }),
      this.prisma.coreDailyLog.count({ where }),
    ]);

    return {
      items: items.map((row) => this.mapRow(row)),
      total,
      skip,
      take,
    };
  }

  async summarize(
    params: SummarizeCoreDailyLogParams,
  ): Promise<CoreDailyLogSummary> {
    const where: Prisma.CoreDailyLogWhereInput = {};
    if (params.companyId != null) where.companyId = params.companyId;
    if (params.siteId != null) where.siteId = params.siteId;
    if (params.logDateFrom || params.logDateTo) {
      where.logDate = {};
      if (params.logDateFrom) {
        where.logDate.gte = new Date(params.logDateFrom);
      }
      if (params.logDateTo) {
        where.logDate.lte = new Date(params.logDateTo);
      }
    }

    const total = await this.prisma.coreDailyLog.count({ where });
    // Prisma groupBy typings can circular-reference on large schemas
    const groups = (await (this.prisma.coreDailyLog as any).groupBy({
      by: ['shift'],
      where,
      _count: { _all: true },
    })) as Array<{ shift: CoreDailyLogShift; _count: { _all: number } }>;

    const byShift: Record<CoreDailyLogShift, number> = {
      DAY: 0,
      NIGHT: 0,
      OTHER: 0,
    };
    for (const g of groups) {
      byShift[g.shift] = g._count._all;
    }

    return {
      total,
      byShift,
      filters: {
        companyId: params.companyId ?? null,
        siteId: params.siteId ?? null,
        logDateFrom: params.logDateFrom ?? null,
        logDateTo: params.logDateTo ?? null,
      },
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.coreDailyLog.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!row) {
      throw new HttpException('Core daily log not found', HttpStatus.NOT_FOUND);
    }
    return this.mapRow(row);
  }

  async update(id: number, dto: UpdateCoreDailyLogDto) {
    await this.findOne(id);
    const n = normalizeCreateInput(dto as CreateCoreDailyLogDto);

    if (dto.title !== undefined) {
      const t = dto.title.trim();
      if (!t) {
        throw new HttpException(
          'title cannot be empty',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const logDateRaw = n.logDateRaw;
    if (logDateRaw !== undefined) {
      const d = new Date(logDateRaw);
      if (Number.isNaN(d.getTime())) {
        throw new HttpException(
          'date must be a valid ISO-8601 date or datetime',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (n.companyId !== undefined && n.companyId !== null) {
      const c = await this.prisma.company.findUnique({
        where: { id: n.companyId },
      });
      if (!c) {
        throw new HttpException(
          'company_id does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (n.siteId !== undefined && n.siteId !== null) {
      const s = await this.prisma.site.findUnique({ where: { id: n.siteId } });
      if (!s) {
        throw new HttpException(
          'site_id does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (n.createdByUserId !== undefined && n.createdByUserId !== null) {
      await this.assertUser(n.createdByUserId, 'createdByUserId');
    }
    if (n.supervisorUserId !== undefined && n.supervisorUserId !== null) {
      await this.assertUser(n.supervisorUserId, 'supervisor');
    }

    const attachmentIds = n.attachmentFileIds;
    if (attachmentIds.length > 0) {
      await this.assertAttachmentFiles(attachmentIds);
    }

    const data: Prisma.CoreDailyLogUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.body !== undefined) {
      data.body =
        dto.body === null || dto.body === '' ? null : dto.body.trim();
    }
    if (dto.activities !== undefined || dto.body !== undefined) {
      const act =
        dto.activities !== undefined
          ? dto.activities?.trim() || null
          : dto.body?.trim() || null;
      data.activities = act;
      if (dto.body === undefined && act != null) data.body = act;
    }
    if (dto.safetyNotes !== undefined || dto.safety_notes !== undefined) {
      data.safetyNotes =
        (dto.safetyNotes ?? dto.safety_notes)?.trim() || null;
    }
    if (logDateRaw !== undefined) data.logDate = new Date(logDateRaw);
    if (dto.shift !== undefined) data.shift = dto.shift;
    if (n.companyId !== undefined) {
      data.company =
        n.companyId == null
          ? { disconnect: true }
          : { connect: { id: n.companyId } };
    }
    if (n.siteId !== undefined) {
      data.site =
        n.siteId == null
          ? { disconnect: true }
          : { connect: { id: n.siteId } };
    }
    if (n.createdByUserId !== undefined) {
      data.createdBy =
        n.createdByUserId == null
          ? { disconnect: true }
          : { connect: { id: n.createdByUserId } };
    }
    if (n.supervisorUserId !== undefined) {
      data.supervisor =
        n.supervisorUserId == null
          ? { disconnect: true }
          : { connect: { id: n.supervisorUserId } };
    }

    if (
      dto.attachmentFileIds !== undefined ||
      dto.attachments !== undefined
    ) {
      data.attachments = {
        deleteMany: {},
        create: attachmentIds.map((coreFileId) => ({ coreFileId })),
      };
    }

    const row = await this.prisma.coreDailyLog.update({
      where: { id },
      data,
      include: includeRelations,
    });
    return this.mapRow(row);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.coreDailyLog.delete({ where: { id } });
    return { id, deleted: true as const };
  }
}

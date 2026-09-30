import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CoreMeetingRecordType, Prisma } from '@prisma/client';
import { clampCoreCrudTake } from '../../common/constants/core-crud-list.constants';
import { PrismaService } from '../../prisma/prisma.service';
import type { CoreMeetingRecordSummary } from './entities/core-meeting-record.entity';
import { CreateCoreMeetingRecordDto } from './dto/create-core-meeting-record.dto';
import {
  CORE_MEETING_RECORD_LIST_SORT_FIELDS,
  type CoreMeetingRecordListSortField,
} from './dto/list-core-meeting-record.query.dto';
import { UpdateCoreMeetingRecordDto } from './dto/update-core-meeting-record.dto';

const includeRelations = {
  company: { select: { id: true, name: true } as const },
  site: { select: { id: true, name: true, code: true } as const },
  recordedBy: { select: { id: true, username: true } as const },
} as const;

export type ListCoreMeetingRecordsParams = {
  companyId?: number;
  siteId?: number;
  meetingType?: CoreMeetingRecordType;
  heldFrom?: string;
  heldTo?: string;
  skip?: number;
  take?: number;
  sortBy?: CoreMeetingRecordListSortField;
  sortOrder?: 'asc' | 'desc';
};

export type SummarizeCoreMeetingRecordsParams = {
  companyId?: number;
  siteId?: number;
  heldFrom?: string;
  heldTo?: string;
};

@Injectable()
export class CoreMeetingRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCoreMeetingRecordDto) {
    const title = dto.title?.trim();
    if (!title) {
      throw new HttpException('title is required', HttpStatus.BAD_REQUEST);
    }

    const heldAt = new Date(dto.heldAt);
    if (Number.isNaN(heldAt.getTime())) {
      throw new HttpException(
        'heldAt must be a valid ISO-8601 datetime',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.companyId != null) {
      const c = await this.prisma.company.findUnique({
        where: { id: dto.companyId },
      });
      if (!c) {
        throw new HttpException(
          'companyId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (dto.siteId != null) {
      const s = await this.prisma.site.findUnique({
        where: { id: dto.siteId },
      });
      if (!s) {
        throw new HttpException(
          'siteId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (dto.recordedByUserId != null) {
      const u = await this.prisma.user.findUnique({
        where: { id: dto.recordedByUserId },
      });
      if (!u) {
        throw new HttpException(
          'recordedByUserId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return this.prisma.coreMeetingRecord.create({
      data: {
        title,
        body: dto.body?.trim() ?? null,
        meetingType: dto.meetingType ?? CoreMeetingRecordType.TOOLBOX,
        heldAt,
        companyId: dto.companyId ?? null,
        siteId: dto.siteId ?? null,
        recordedByUserId: dto.recordedByUserId ?? null,
      },
      include: includeRelations,
    });
  }

  async findAll(params: ListCoreMeetingRecordsParams) {
    const take = clampCoreCrudTake(params.take);
    const skip = params.skip ?? 0;

    let heldFrom: Date | undefined;
    let heldTo: Date | undefined;

    if (params.heldFrom != null && params.heldFrom !== '') {
      heldFrom = new Date(params.heldFrom);
      if (Number.isNaN(heldFrom.getTime())) {
        throw new HttpException(
          'heldFrom must be a valid ISO-8601 date or datetime',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (params.heldTo != null && params.heldTo !== '') {
      heldTo = new Date(params.heldTo);
      if (Number.isNaN(heldTo.getTime())) {
        throw new HttpException(
          'heldTo must be a valid ISO-8601 date or datetime',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (
      heldFrom != null &&
      heldTo != null &&
      heldFrom.getTime() > heldTo.getTime()
    ) {
      throw new HttpException(
        'heldFrom must be before or equal to heldTo',
        HttpStatus.BAD_REQUEST,
      );
    }

    const where: Prisma.CoreMeetingRecordWhereInput = {};
    if (params.companyId != null) where.companyId = params.companyId;
    if (params.siteId != null) where.siteId = params.siteId;
    if (params.meetingType != null) where.meetingType = params.meetingType;

    if (heldFrom != null || heldTo != null) {
      where.heldAt = {};
      if (heldFrom != null) where.heldAt.gte = heldFrom;
      if (heldTo != null) where.heldAt.lte = heldTo;
    }

    const sortField: CoreMeetingRecordListSortField =
      params.sortBy != null &&
      (CORE_MEETING_RECORD_LIST_SORT_FIELDS as readonly string[]).includes(
        params.sortBy,
      )
        ? params.sortBy
        : 'heldAt';
    const sortDir: Prisma.SortOrder =
      params.sortOrder === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.CoreMeetingRecordOrderByWithRelationInput[] = [
      { [sortField]: sortDir },
      { id: sortDir },
    ];

    const [items, total] = await this.prisma.$transaction([
      this.prisma.coreMeetingRecord.findMany({
        where,
        orderBy,
        skip,
        take,
        include: includeRelations,
      }),
      this.prisma.coreMeetingRecord.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  /**
   * Aggregate counts by meeting type for dashboards / compliance reporting.
   */
  async summarize(
    params: SummarizeCoreMeetingRecordsParams,
  ): Promise<CoreMeetingRecordSummary> {
    let heldFrom: Date | undefined;
    let heldTo: Date | undefined;

    if (params.heldFrom != null && params.heldFrom !== '') {
      heldFrom = new Date(params.heldFrom);
      if (Number.isNaN(heldFrom.getTime())) {
        throw new HttpException(
          'heldFrom must be a valid ISO-8601 date or datetime',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (params.heldTo != null && params.heldTo !== '') {
      heldTo = new Date(params.heldTo);
      if (Number.isNaN(heldTo.getTime())) {
        throw new HttpException(
          'heldTo must be a valid ISO-8601 date or datetime',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (
      heldFrom != null &&
      heldTo != null &&
      heldFrom.getTime() > heldTo.getTime()
    ) {
      throw new HttpException(
        'heldFrom must be before or equal to heldTo',
        HttpStatus.BAD_REQUEST,
      );
    }

    const where: Prisma.CoreMeetingRecordWhereInput = {};
    if (params.companyId != null) where.companyId = params.companyId;
    if (params.siteId != null) where.siteId = params.siteId;

    if (heldFrom != null || heldTo != null) {
      where.heldAt = {};
      if (heldFrom != null) where.heldAt.gte = heldFrom;
      if (heldTo != null) where.heldAt.lte = heldTo;
    }

    const grouped = await this.prisma.coreMeetingRecord.groupBy({
      by: ['meetingType'],
      where,
      _count: { _all: true },
    });

    const byType = {
      [CoreMeetingRecordType.TEAM_SAFETY]: 0,
      [CoreMeetingRecordType.TOOLBOX]: 0,
      [CoreMeetingRecordType.MANAGEMENT_REVIEW]: 0,
      [CoreMeetingRecordType.OTHER]: 0,
    } as Record<CoreMeetingRecordType, number>;

    let total = 0;
    for (const row of grouped) {
      const c = row._count._all;
      byType[row.meetingType] = c;
      total += c;
    }

    return {
      total,
      byType,
      filters: {
        companyId: params.companyId ?? null,
        siteId: params.siteId ?? null,
        heldFrom: params.heldFrom ?? null,
        heldTo: params.heldTo ?? null,
      },
    };
  }

  async findOne(id: number) {
    const row = await this.prisma.coreMeetingRecord.findUnique({
      where: { id },
      include: {
        ...includeRelations,
        coreActionItems: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueAt: true,
          },
          orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });
    if (!row) {
      throw new HttpException(
        'Core meeting record not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  async update(id: number, dto: UpdateCoreMeetingRecordDto) {
    await this.findOne(id);

    if (dto.title !== undefined && dto.title.trim() === '') {
      throw new HttpException('title cannot be empty', HttpStatus.BAD_REQUEST);
    }

    if (dto.heldAt !== undefined) {
      const heldAt = new Date(dto.heldAt);
      if (Number.isNaN(heldAt.getTime())) {
        throw new HttpException(
          'heldAt must be a valid ISO-8601 datetime',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (dto.companyId !== undefined && dto.companyId !== null) {
      const c = await this.prisma.company.findUnique({
        where: { id: dto.companyId },
      });
      if (!c) {
        throw new HttpException(
          'companyId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (dto.siteId !== undefined && dto.siteId !== null) {
      const s = await this.prisma.site.findUnique({
        where: { id: dto.siteId },
      });
      if (!s) {
        throw new HttpException(
          'siteId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (dto.recordedByUserId !== undefined && dto.recordedByUserId !== null) {
      const u = await this.prisma.user.findUnique({
        where: { id: dto.recordedByUserId },
      });
      if (!u) {
        throw new HttpException(
          'recordedByUserId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.body !== undefined) {
      data.body = dto.body === null || dto.body === '' ? null : dto.body.trim();
    }
    if (dto.meetingType !== undefined) data.meetingType = dto.meetingType;
    if (dto.heldAt !== undefined) data.heldAt = new Date(dto.heldAt);
    if (dto.companyId !== undefined) data.companyId = dto.companyId ?? null;
    if (dto.siteId !== undefined) data.siteId = dto.siteId ?? null;
    if (dto.recordedByUserId !== undefined) {
      data.recordedByUserId = dto.recordedByUserId ?? null;
    }

    return this.prisma.coreMeetingRecord.update({
      where: { id },
      data: data as never,
      include: includeRelations,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.coreMeetingRecord.delete({ where: { id } });
    return { id, deleted: true as const };
  }
}

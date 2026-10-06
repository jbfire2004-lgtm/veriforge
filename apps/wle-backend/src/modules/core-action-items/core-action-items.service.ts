import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { clampCoreCrudTake } from '../../common/constants/core-crud-list.constants';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreActionItemVerification } from './core-action-item.verification';
import { CreateCoreActionItemDto } from './dto/create-core-action-item.dto';
import {
  CORE_ACTION_ITEM_LIST_SORT_FIELDS,
  type CoreActionItemListSortField,
} from './dto/list-core-action-items.query.dto';
import { UpdateCoreActionItemDto } from './dto/update-core-action-item.dto';

const actionItemInclude = {
  company: { select: { id: true, name: true } as const },
  createdBy: { select: { id: true, username: true } as const },
  coreMeetingRecord: {
    select: {
      id: true,
      title: true,
      heldAt: true,
      meetingType: true,
    } as const,
  },
  coreDailyLog: {
    select: {
      id: true,
      title: true,
      logDate: true,
      shift: true,
    } as const,
  },
} as const;

export type ListCoreActionItemsQuery = {
  companyId?: number;
  coreMeetingRecordId?: number;
  coreDailyLogId?: number;
  status?: string;
  priority?: string;
  skip?: number;
  take?: number;
  sortBy?: CoreActionItemListSortField;
  sortOrder?: 'asc' | 'desc';
};

@Injectable()
export class CoreActionItemsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertMeetingCompanyAlignment(
    meeting: { id: number; companyId: number | null },
    companyId: number | null,
  ): void {
    if (
      meeting.companyId != null &&
      companyId != null &&
      meeting.companyId !== companyId
    ) {
      throw new HttpException(
        'companyId does not match the linked coreMeetingRecord',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private assertDailyLogCompanyAlignment(
    log: { id: number; companyId: number | null },
    companyId: number | null,
  ): void {
    if (
      log.companyId != null &&
      companyId != null &&
      log.companyId !== companyId
    ) {
      throw new HttpException(
        'companyId does not match the linked coreDailyLog',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private assertSingleParent(
    meetingId: number | null,
    dailyLogId: number | null,
  ): void {
    if (meetingId != null && dailyLogId != null) {
      throw new HttpException(
        'Cannot link both coreMeetingRecordId and coreDailyLogId',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(dto: CreateCoreActionItemDto) {
    CoreActionItemVerification.validateCreatePayload(dto);

    this.assertSingleParent(
      dto.coreMeetingRecordId ?? null,
      dto.coreDailyLogId ?? null,
    );

    let effectiveCompanyId = dto.companyId ?? null;

    if (dto.coreMeetingRecordId != null) {
      const meeting = await this.prisma.coreMeetingRecord.findUnique({
        where: { id: dto.coreMeetingRecordId },
        select: { id: true, companyId: true },
      });
      if (!meeting) {
        throw new HttpException(
          'coreMeetingRecordId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (effectiveCompanyId == null && meeting.companyId != null) {
        effectiveCompanyId = meeting.companyId;
      }
      this.assertMeetingCompanyAlignment(meeting, effectiveCompanyId);
    }

    if (dto.coreDailyLogId != null) {
      const log = await this.prisma.coreDailyLog.findUnique({
        where: { id: dto.coreDailyLogId },
        select: { id: true, companyId: true },
      });
      if (!log) {
        throw new HttpException(
          'coreDailyLogId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (effectiveCompanyId == null && log.companyId != null) {
        effectiveCompanyId = log.companyId;
      }
      this.assertDailyLogCompanyAlignment(log, effectiveCompanyId);
    }

    if (effectiveCompanyId != null) {
      const c = await this.prisma.company.findUnique({
        where: { id: effectiveCompanyId },
      });
      if (!c) {
        throw new HttpException(
          'companyId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (dto.createdById != null) {
      const u = await this.prisma.user.findUnique({
        where: { id: dto.createdById },
      });
      if (!u) {
        throw new HttpException(
          'createdById does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const status = dto.status ?? 'OPEN';
    const priority = dto.priority ?? 'NORMAL';

    const row = await this.prisma.coreActionItem.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim() ?? null,
        status,
        priority,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        companyId: effectiveCompanyId,
        createdById: dto.createdById ?? null,
        coreMeetingRecordId: dto.coreMeetingRecordId ?? null,
        coreDailyLogId: dto.coreDailyLogId ?? null,
      },
      include: actionItemInclude,
    });

    const overdueWarning = CoreActionItemVerification.isOverdueOpen(
      status,
      dto.dueAt,
    );

    return {
      ...row,
      verification: overdueWarning
        ? ({ overdueWarning: true } as const)
        : undefined,
    };
  }

  async findAll(query: ListCoreActionItemsQuery) {
    const take = clampCoreCrudTake(query.take);
    const skip = query.skip ?? 0;

    const where: Prisma.CoreActionItemWhereInput = {};
    if (query.companyId != null) where.companyId = query.companyId;
    if (query.coreMeetingRecordId != null) {
      where.coreMeetingRecordId = query.coreMeetingRecordId;
    }
    if (query.coreDailyLogId != null) {
      where.coreDailyLogId = query.coreDailyLogId;
    }
    if (query.status != null && query.status !== '') {
      where.status = query.status;
    }
    if (query.priority != null && query.priority !== '') {
      where.priority = query.priority;
    }

    const sortField: CoreActionItemListSortField =
      query.sortBy != null &&
      (CORE_ACTION_ITEM_LIST_SORT_FIELDS as readonly string[]).includes(
        query.sortBy,
      )
        ? query.sortBy
        : 'dueAt';
    const sortDir: Prisma.SortOrder =
      query.sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy: Prisma.CoreActionItemOrderByWithRelationInput[] = [
      { [sortField]: sortDir },
      { createdAt: 'desc' },
    ];

    const [items, total] = await this.prisma.$transaction([
      this.prisma.coreActionItem.findMany({
        where,
        orderBy,
        skip,
        take,
        include: actionItemInclude,
      }),
      this.prisma.coreActionItem.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findOne(id: string) {
    const row = await this.prisma.coreActionItem.findUnique({
      where: { id },
      include: actionItemInclude,
    });
    if (!row) {
      throw new HttpException(
        'Core action item not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  async update(id: string, dto: UpdateCoreActionItemDto) {
    CoreActionItemVerification.validateUpdatePayload(dto);

    if (
      dto.coreMeetingRecordId !== undefined &&
      dto.coreDailyLogId !== undefined &&
      dto.coreMeetingRecordId != null &&
      dto.coreDailyLogId != null
    ) {
      throw new HttpException(
        'Cannot set both coreMeetingRecordId and coreDailyLogId in one request',
        HttpStatus.BAD_REQUEST,
      );
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

    if (dto.createdById !== undefined && dto.createdById !== null) {
      const u = await this.prisma.user.findUnique({
        where: { id: dto.createdById },
      });
      if (!u) {
        throw new HttpException(
          'createdById does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const existing = await this.prisma.coreActionItem.findUnique({
      where: { id },
      select: {
        companyId: true,
        coreMeetingRecordId: true,
        coreDailyLogId: true,
      },
    });
    if (!existing) {
      throw new HttpException(
        'Core action item not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const nextCompanyId =
      dto.companyId !== undefined ? dto.companyId ?? null : existing.companyId;
    let nextMeetingId =
      dto.coreMeetingRecordId !== undefined
        ? dto.coreMeetingRecordId
        : existing.coreMeetingRecordId;
    let nextDailyLogId =
      dto.coreDailyLogId !== undefined
        ? dto.coreDailyLogId
        : existing.coreDailyLogId;

    // Linking a non-null parent in PATCH clears the other parent (exclusive contexts).
    if (
      dto.coreMeetingRecordId !== undefined &&
      dto.coreMeetingRecordId != null
    ) {
      nextDailyLogId = null;
    }
    if (dto.coreDailyLogId !== undefined && dto.coreDailyLogId != null) {
      nextMeetingId = null;
    }

    this.assertSingleParent(nextMeetingId, nextDailyLogId);

    if (
      dto.coreMeetingRecordId !== undefined &&
      dto.coreMeetingRecordId != null
    ) {
      const meeting = await this.prisma.coreMeetingRecord.findUnique({
        where: { id: dto.coreMeetingRecordId },
        select: { id: true, companyId: true },
      });
      if (!meeting) {
        throw new HttpException(
          'coreMeetingRecordId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.assertMeetingCompanyAlignment(meeting, nextCompanyId);
    } else if (
      nextMeetingId != null &&
      (dto.companyId !== undefined || dto.coreMeetingRecordId !== undefined)
    ) {
      const meeting = await this.prisma.coreMeetingRecord.findUnique({
        where: { id: nextMeetingId },
        select: { id: true, companyId: true },
      });
      if (meeting) {
        this.assertMeetingCompanyAlignment(meeting, nextCompanyId);
      }
    }

    if (dto.coreDailyLogId !== undefined && dto.coreDailyLogId != null) {
      const log = await this.prisma.coreDailyLog.findUnique({
        where: { id: dto.coreDailyLogId },
        select: { id: true, companyId: true },
      });
      if (!log) {
        throw new HttpException(
          'coreDailyLogId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
      this.assertDailyLogCompanyAlignment(log, nextCompanyId);
    } else if (
      nextDailyLogId != null &&
      (dto.companyId !== undefined ||
        dto.coreDailyLogId !== undefined ||
        dto.coreMeetingRecordId !== undefined)
    ) {
      const log = await this.prisma.coreDailyLog.findUnique({
        where: { id: nextDailyLogId },
        select: { id: true, companyId: true },
      });
      if (log) {
        this.assertDailyLogCompanyAlignment(log, nextCompanyId);
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) {
      data.description =
        dto.description === null || dto.description === ''
          ? null
          : dto.description.trim();
    }
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.dueAt !== undefined) {
      data.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
    }
    if (dto.companyId !== undefined) data.companyId = dto.companyId ?? null;
    if (dto.createdById !== undefined) {
      data.createdById = dto.createdById ?? null;
    }
    if (dto.coreMeetingRecordId !== undefined) {
      data.coreMeetingRecordId = dto.coreMeetingRecordId;
      if (dto.coreMeetingRecordId != null) {
        data.coreDailyLogId = null;
      }
    }
    if (dto.coreDailyLogId !== undefined) {
      data.coreDailyLogId = dto.coreDailyLogId;
      if (dto.coreDailyLogId != null) {
        data.coreMeetingRecordId = null;
      }
    }

    return this.prisma.coreActionItem.update({
      where: { id },
      data: data as never,
      include: actionItemInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.coreActionItem.delete({ where: { id } });
    return { id, deleted: true as const };
  }
}

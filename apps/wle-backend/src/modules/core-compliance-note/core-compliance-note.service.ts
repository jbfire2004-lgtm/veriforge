import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CoreComplianceNoteCategory,
  CoreComplianceNotePriority,
  CoreComplianceNoteStatus,
  Prisma,
} from '@prisma/client';
import { clampCoreCrudTake } from '../../common/constants/core-crud-list.constants';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCoreComplianceNoteDto } from './dto/create-core-compliance-note.dto';
import {
  CORE_COMPLIANCE_NOTE_LIST_SORT_FIELDS,
  type CoreComplianceNoteListSortField,
} from './dto/list-core-compliance-note.query.dto';
import { UpdateCoreComplianceNoteDto } from './dto/update-core-compliance-note.dto';

export type ListCoreComplianceNoteQuery = {
  companyId?: number;
  siteId?: number;
  status?: CoreComplianceNoteStatus;
  category?: CoreComplianceNoteCategory;
  priority?: CoreComplianceNotePriority;
  dueFrom?: string;
  dueTo?: string;
  skip?: number;
  take?: number;
  sortBy?: CoreComplianceNoteListSortField;
  sortOrder?: 'asc' | 'desc';
};

const includeRelations = {
  company: { select: { id: true, name: true } as const },
  site: { select: { id: true, name: true, code: true } as const },
  createdBy: { select: { id: true, username: true } as const },
} as const;

@Injectable()
export class CoreComplianceNoteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCoreComplianceNoteDto) {
    const title = dto.title?.trim();
    if (!title) {
      throw new HttpException('title is required', HttpStatus.BAD_REQUEST);
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

    if (dto.createdByUserId != null) {
      const u = await this.prisma.user.findUnique({
        where: { id: dto.createdByUserId },
      });
      if (!u) {
        throw new HttpException(
          'createdByUserId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    let dueAt: Date | null = null;
    if (dto.dueAt != null && dto.dueAt !== '') {
      const d = new Date(dto.dueAt);
      if (Number.isNaN(d.getTime())) {
        throw new HttpException(
          'dueAt must be a valid ISO-8601 datetime',
          HttpStatus.BAD_REQUEST,
        );
      }
      dueAt = d;
    }

    return this.prisma.coreComplianceNote.create({
      data: {
        title,
        body: dto.body?.trim() ?? null,
        category: dto.category ?? CoreComplianceNoteCategory.INTERNAL,
        status: dto.status ?? CoreComplianceNoteStatus.DRAFT,
        priority: dto.priority ?? CoreComplianceNotePriority.NORMAL,
        dueAt,
        companyId: dto.companyId ?? null,
        siteId: dto.siteId ?? null,
        createdByUserId: dto.createdByUserId ?? null,
      },
      include: includeRelations,
    });
  }

  async findAll(query: ListCoreComplianceNoteQuery) {
    const take = clampCoreCrudTake(query.take);
    const skip = query.skip ?? 0;

    let dueFrom: Date | undefined;
    let dueTo: Date | undefined;

    if (query.dueFrom != null && query.dueFrom !== '') {
      dueFrom = new Date(query.dueFrom);
      if (Number.isNaN(dueFrom.getTime())) {
        throw new HttpException(
          'dueFrom must be a valid ISO-8601 date or datetime',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (query.dueTo != null && query.dueTo !== '') {
      dueTo = new Date(query.dueTo);
      if (Number.isNaN(dueTo.getTime())) {
        throw new HttpException(
          'dueTo must be a valid ISO-8601 date or datetime',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (
      dueFrom != null &&
      dueTo != null &&
      dueFrom.getTime() > dueTo.getTime()
    ) {
      throw new HttpException(
        'dueFrom must be before or equal to dueTo',
        HttpStatus.BAD_REQUEST,
      );
    }

    const where: Prisma.CoreComplianceNoteWhereInput = {};

    if (query.companyId != null) where.companyId = query.companyId;
    if (query.siteId != null) where.siteId = query.siteId;
    if (query.status != null) where.status = query.status;
    if (query.category != null) where.category = query.category;
    if (query.priority != null) where.priority = query.priority;

    if (dueFrom != null || dueTo != null) {
      where.dueAt = {};
      if (dueFrom != null) where.dueAt.gte = dueFrom;
      if (dueTo != null) where.dueAt.lte = dueTo;
    }

    const sortField: CoreComplianceNoteListSortField =
      query.sortBy != null &&
      (CORE_COMPLIANCE_NOTE_LIST_SORT_FIELDS as readonly string[]).includes(
        query.sortBy,
      )
        ? query.sortBy
        : 'updatedAt';
    const sortDir: Prisma.SortOrder =
      query.sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy: Prisma.CoreComplianceNoteOrderByWithRelationInput[] = [
      { [sortField]: sortDir },
      { id: 'desc' },
    ];

    const [items, total] = await this.prisma.$transaction([
      this.prisma.coreComplianceNote.findMany({
        where,
        orderBy,
        skip,
        take,
        include: includeRelations,
      }),
      this.prisma.coreComplianceNote.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findOne(id: number) {
    const row = await this.prisma.coreComplianceNote.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!row) {
      throw new HttpException(
        'Core compliance note not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  async update(id: number, dto: UpdateCoreComplianceNoteDto) {
    await this.findOne(id);

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

    if (dto.createdByUserId !== undefined && dto.createdByUserId !== null) {
      const u = await this.prisma.user.findUnique({
        where: { id: dto.createdByUserId },
      });
      if (!u) {
        throw new HttpException(
          'createdByUserId does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const data: Record<string, unknown> = {};

    if (dto.title !== undefined) {
      const t = dto.title.trim();
      if (!t) {
        throw new HttpException(
          'title cannot be empty',
          HttpStatus.BAD_REQUEST,
        );
      }
      data.title = t;
    }
    if (dto.body !== undefined) {
      data.body = dto.body === null || dto.body === '' ? null : dto.body.trim();
    }
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.companyId !== undefined) data.companyId = dto.companyId ?? null;
    if (dto.siteId !== undefined) data.siteId = dto.siteId ?? null;
    if (dto.createdByUserId !== undefined) {
      data.createdByUserId = dto.createdByUserId ?? null;
    }

    if (dto.dueAt !== undefined) {
      if (dto.dueAt === null || dto.dueAt === '') {
        data.dueAt = null;
      } else {
        const d = new Date(dto.dueAt);
        if (Number.isNaN(d.getTime())) {
          throw new HttpException(
            'dueAt must be a valid ISO-8601 datetime',
            HttpStatus.BAD_REQUEST,
          );
        }
        data.dueAt = d;
      }
    }

    return this.prisma.coreComplianceNote.update({
      where: { id },
      data: data as never,
      include: includeRelations,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.coreComplianceNote.delete({ where: { id } });
    return { id, deleted: true as const };
  }
}

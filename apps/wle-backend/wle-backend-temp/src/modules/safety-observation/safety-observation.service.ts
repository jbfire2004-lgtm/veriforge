import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  Prisma,
  SafetyObservationSeverity,
  SafetyObservationStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSafetyObservationDto } from './dto/create-safety-observation.dto';
import { UpdateSafetyObservationDto } from './dto/update-safety-observation.dto';

export type ListSafetyObservationQuery = {
  companyId?: number;
  siteId?: number;
  status?: SafetyObservationStatus;
  severity?: SafetyObservationSeverity;
  skip?: number;
  take?: number;
};

const includeRelations = {
  company: { select: { id: true, name: true } as const },
  site: { select: { id: true, name: true, code: true } as const },
  reportedBy: { select: { id: true, username: true } as const },
} as const;

/** Same messages as legacy service — do not change without API contract review. */
const E = {
  TITLE: 'title is required',
  COMPANY: 'companyId does not exist',
  SITE: 'siteId does not exist',
  USER: 'reportedByUserId does not exist',
  OBSERVED_AT: 'observedAt must be a valid ISO-8601 datetime',
  NOT_FOUND: 'Safety observation not found',
} as const;

type OptionalForeignKeys = {
  companyId?: number | null;
  siteId?: number | null;
  reportedByUserId?: number | null;
};

@Injectable()
export class SafetyObservationService {
  constructor(private readonly prisma: PrismaService) {}

  private parseObservedAtIso(iso: string): Date {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      throw new HttpException(E.OBSERVED_AT, HttpStatus.BAD_REQUEST);
    }
    return d;
  }

  /** Validates FK rows exist when ids are non-null (create or update partial). */
  private async assertOptionalForeignKeys(
    fk: OptionalForeignKeys,
  ): Promise<void> {
    if (fk.companyId != null) {
      const row = await this.prisma.company.findUnique({
        where: { id: fk.companyId },
      });
      if (!row) throw new HttpException(E.COMPANY, HttpStatus.BAD_REQUEST);
    }
    if (fk.siteId != null) {
      const row = await this.prisma.site.findUnique({
        where: { id: fk.siteId },
      });
      if (!row) throw new HttpException(E.SITE, HttpStatus.BAD_REQUEST);
    }
    if (fk.reportedByUserId != null) {
      const row = await this.prisma.user.findUnique({
        where: { id: fk.reportedByUserId },
      });
      if (!row) throw new HttpException(E.USER, HttpStatus.BAD_REQUEST);
    }
  }

  private listWhere(
    query: ListSafetyObservationQuery,
  ): Prisma.SafetyObservationWhereInput {
    const where: Prisma.SafetyObservationWhereInput = {};
    if (query.companyId != null) where.companyId = query.companyId;
    if (query.siteId != null) where.siteId = query.siteId;
    if (query.status != null) where.status = query.status;
    if (query.severity != null) where.severity = query.severity;
    return where;
  }

  /**
   * Maps PATCH body to Prisma update fields. Scalars use unchecked shape at runtime
   * (same as legacy `as never` cast).
   */
  private buildUpdateData(
    dto: UpdateSafetyObservationDto,
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) {
      data.description =
        dto.description === null || dto.description === ''
          ? null
          : dto.description.trim();
    }
    if (dto.severity !== undefined) data.severity = dto.severity;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.observedAt !== undefined) {
      data.observedAt = this.parseObservedAtIso(dto.observedAt);
    }
    if (dto.locationNote !== undefined) {
      data.locationNote =
        dto.locationNote === null || dto.locationNote === ''
          ? null
          : dto.locationNote.trim();
    }
    if (dto.companyId !== undefined) data.companyId = dto.companyId ?? null;
    if (dto.siteId !== undefined) data.siteId = dto.siteId ?? null;
    if (dto.reportedByUserId !== undefined) {
      data.reportedByUserId = dto.reportedByUserId ?? null;
    }

    return data;
  }

  async create(dto: CreateSafetyObservationDto) {
    const title = dto.title?.trim();
    if (!title) {
      throw new HttpException(E.TITLE, HttpStatus.BAD_REQUEST);
    }

    await this.assertOptionalForeignKeys({
      companyId: dto.companyId ?? null,
      siteId: dto.siteId ?? null,
      reportedByUserId: dto.reportedByUserId ?? null,
    });

    const observedAt = this.parseObservedAtIso(dto.observedAt);

    return this.prisma.safetyObservation.create({
      data: {
        title,
        description: dto.description?.trim() ?? null,
        severity: dto.severity ?? SafetyObservationSeverity.MEDIUM,
        status: dto.status ?? SafetyObservationStatus.OPEN,
        observedAt,
        locationNote: dto.locationNote?.trim() ?? null,
        companyId: dto.companyId ?? null,
        siteId: dto.siteId ?? null,
        reportedByUserId: dto.reportedByUserId ?? null,
      },
      include: includeRelations,
    });
  }

  async findAll(query: ListSafetyObservationQuery) {
    const take = Math.min(query.take ?? 50, 200);
    const skip = query.skip ?? 0;
    const where = this.listWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.safetyObservation.findMany({
        where,
        orderBy: [{ observedAt: 'desc' }, { id: 'desc' }],
        skip,
        take,
        include: includeRelations,
      }),
      this.prisma.safetyObservation.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findOne(id: number) {
    const row = await this.prisma.safetyObservation.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!row) {
      throw new HttpException(E.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return row;
  }

  async update(id: number, dto: UpdateSafetyObservationDto) {
    await this.findOne(id);

    await this.assertOptionalForeignKeys({
      companyId: dto.companyId,
      siteId: dto.siteId,
      reportedByUserId: dto.reportedByUserId,
    });

    const data = this.buildUpdateData(dto);

    return this.prisma.safetyObservation.update({
      where: { id },
      data: data as never,
      include: includeRelations,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.safetyObservation.delete({ where: { id } });
    return { id, deleted: true as const };
  }
}

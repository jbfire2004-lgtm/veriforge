import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CoreSiteRiskCategory,
  CoreSiteRiskSeverity,
  CoreSiteRiskStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCoreSiteRiskDto } from './dto/create-core-site-risk.dto';
import { UpdateCoreSiteRiskDto } from './dto/update-core-site-risk.dto';

export type ListCoreSiteRiskQuery = {
  companyId?: number;
  siteId?: number;
  status?: CoreSiteRiskStatus;
  category?: CoreSiteRiskCategory;
  severity?: CoreSiteRiskSeverity;
  skip?: number;
  take?: number;
};

const includeRelations = {
  company: { select: { id: true, name: true } as const },
  site: { select: { id: true, name: true, code: true } as const },
  owner: { select: { id: true, username: true } as const },
} as const;

const E = {
  TITLE: 'title is required',
  COMPANY: 'companyId does not exist',
  SITE: 'siteId does not exist',
  OWNER: 'ownerUserId does not exist',
  IDENTIFIED_AT: 'identifiedAt must be a valid ISO-8601 datetime',
  MITIGATED_AT: 'mitigatedAt must be a valid ISO-8601 datetime',
  NOT_FOUND: 'Core site risk not found',
} as const;

type OptionalFks = {
  companyId?: number | null;
  siteId?: number | null;
  ownerUserId?: number | null;
};

@Injectable()
export class CoreSiteRiskService {
  constructor(private readonly prisma: PrismaService) {}

  private parseRequiredDate(iso: string, err: string): Date {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
    return d;
  }

  private parseOptionalDate(
    iso: string | undefined | null,
    err: string,
  ): Date | null {
    if (iso == null || iso === '') return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
    return d;
  }

  private async assertOptionalForeignKeys(fk: OptionalFks): Promise<void> {
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
    if (fk.ownerUserId != null) {
      const row = await this.prisma.user.findUnique({
        where: { id: fk.ownerUserId },
      });
      if (!row) throw new HttpException(E.OWNER, HttpStatus.BAD_REQUEST);
    }
  }

  private listWhere(
    query: ListCoreSiteRiskQuery,
  ): Prisma.CoreSiteRiskWhereInput {
    const where: Prisma.CoreSiteRiskWhereInput = {};
    if (query.companyId != null) where.companyId = query.companyId;
    if (query.siteId != null) where.siteId = query.siteId;
    if (query.status != null) where.status = query.status;
    if (query.category != null) where.category = query.category;
    if (query.severity != null) where.severity = query.severity;
    return where;
  }

  async create(dto: CreateCoreSiteRiskDto) {
    const title = dto.title?.trim();
    if (!title) {
      throw new HttpException(E.TITLE, HttpStatus.BAD_REQUEST);
    }

    await this.assertOptionalForeignKeys({
      companyId: dto.companyId ?? null,
      siteId: dto.siteId ?? null,
      ownerUserId: dto.ownerUserId ?? null,
    });

    const identifiedAt = this.parseRequiredDate(
      dto.identifiedAt,
      E.IDENTIFIED_AT,
    );
    const mitigatedAt = this.parseOptionalDate(dto.mitigatedAt, E.MITIGATED_AT);

    return this.prisma.coreSiteRisk.create({
      data: {
        title,
        description: dto.description?.trim() ?? null,
        category: dto.category ?? CoreSiteRiskCategory.OTHER,
        severity: dto.severity ?? CoreSiteRiskSeverity.MEDIUM,
        status: dto.status ?? CoreSiteRiskStatus.OPEN,
        identifiedAt,
        mitigatedAt,
        locationNote: dto.locationNote?.trim() ?? null,
        companyId: dto.companyId ?? null,
        siteId: dto.siteId ?? null,
        ownerUserId: dto.ownerUserId ?? null,
      },
      include: includeRelations,
    });
  }

  async findAll(query: ListCoreSiteRiskQuery) {
    const take = Math.min(query.take ?? 50, 200);
    const skip = query.skip ?? 0;
    const where = this.listWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.coreSiteRisk.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip,
        take,
        include: includeRelations,
      }),
      this.prisma.coreSiteRisk.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findOne(id: number) {
    const row = await this.prisma.coreSiteRisk.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!row) {
      throw new HttpException(E.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return row;
  }

  async update(id: number, dto: UpdateCoreSiteRiskDto) {
    await this.findOne(id);

    await this.assertOptionalForeignKeys({
      companyId: dto.companyId,
      siteId: dto.siteId,
      ownerUserId: dto.ownerUserId,
    });

    const data = this.buildUpdateData(dto);

    return this.prisma.coreSiteRisk.update({
      where: { id },
      data: data as never,
      include: includeRelations,
    });
  }

  private buildUpdateData(dto: UpdateCoreSiteRiskDto): Record<string, unknown> {
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
    if (dto.description !== undefined) {
      data.description =
        dto.description === null || dto.description === ''
          ? null
          : dto.description.trim();
    }
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.severity !== undefined) data.severity = dto.severity;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.identifiedAt !== undefined) {
      data.identifiedAt = this.parseRequiredDate(
        dto.identifiedAt,
        E.IDENTIFIED_AT,
      );
    }
    if (dto.mitigatedAt !== undefined) {
      data.mitigatedAt =
        dto.mitigatedAt === null || dto.mitigatedAt === ''
          ? null
          : this.parseOptionalDate(dto.mitigatedAt, E.MITIGATED_AT);
    }
    if (dto.locationNote !== undefined) {
      data.locationNote =
        dto.locationNote === null || dto.locationNote === ''
          ? null
          : dto.locationNote.trim();
    }
    if (dto.companyId !== undefined) data.companyId = dto.companyId ?? null;
    if (dto.siteId !== undefined) data.siteId = dto.siteId ?? null;
    if (dto.ownerUserId !== undefined) {
      data.ownerUserId = dto.ownerUserId ?? null;
    }

    return data;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.coreSiteRisk.delete({ where: { id } });
    return { id, deleted: true as const };
  }
}

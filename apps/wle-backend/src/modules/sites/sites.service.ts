import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { QuerySiteDto } from './dto/query-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import {
  SiteVerificationEntity,
  SitesPaginatedEntity,
  SiteResponseEntity,
  toSiteResponse,
} from './entities/site.entity';

@Injectable()
export class SitesService {
  constructor(private readonly prisma: PrismaService) {}

  async findPage(query: QuerySiteDto): Promise<SitesPaginatedEntity> {
    const page = query.page ?? 1;
    const pageSize = query.limit ?? 20;
    const skip = (page - 1) * pageSize;
    const search = query.search?.trim();

    const parts: Prisma.SiteWhereInput[] = [];
    if (search && search.length > 0) {
      parts.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { region: { contains: search, mode: 'insensitive' } },
        ],
      });
    }
    if (query.activeOnly === true) {
      parts.push({ active: true });
    }
    const where: Prisma.SiteWhereInput =
      parts.length === 0 ? {} : { AND: parts };

    const sortable = new Set([
      'id',
      'name',
      'code',
      'region',
      'active',
      'createdAt',
    ]);
    const sortField =
      query.sortBy && sortable.has(query.sortBy) ? query.sortBy : 'id';
    const sortDir = query.sortOrder === 'desc' ? 'desc' : 'asc';
    const orderBy = {
      [sortField]: sortDir,
    } as Prisma.SiteOrderByWithRelationInput;

    try {
      const [rows, total] = await this.prisma.$transaction([
        this.prisma.site.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
        }),
        this.prisma.site.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        data: rows.map(toSiteResponse),
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Failed to list sites',
        cause: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async findOne(id: number): Promise<SiteResponseEntity> {
    const row = await this.prisma.site.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException({
        message: `Site ${id} not found`,
        siteId: id,
      });
    }
    return toSiteResponse(row);
  }

  async create(dto: CreateSiteDto): Promise<SiteResponseEntity> {
    const code = dto.code?.trim() || null;
    try {
      const row = await this.prisma.site.create({
        data: {
          name: dto.name.trim(),
          code,
          region: dto.region?.trim() ?? null,
          active: dto.active ?? true,
        },
      });
      return toSiteResponse(row);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException({
          message: 'A site with this code already exists',
          field: 'code',
        });
      }
      throw new InternalServerErrorException({
        message: 'Failed to create site',
        cause: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async update(id: number, dto: UpdateSiteDto): Promise<SiteResponseEntity> {
    await this.ensureExists(id);
    const code = dto.code === undefined ? undefined : dto.code?.trim() || null;
    try {
      const row = await this.prisma.site.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name.trim() }),
          ...(code !== undefined && { code }),
          ...(dto.region !== undefined && {
            region: dto.region?.trim() ?? null,
          }),
          ...(dto.active !== undefined && { active: dto.active }),
        },
      });
      return toSiteResponse(row);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException({
          message: 'A site with this code already exists',
          field: 'code',
        });
      }
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException({
          message: `Site ${id} not found`,
          siteId: id,
        });
      }
      throw new InternalServerErrorException({
        message: 'Failed to update site',
        cause: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async remove(id: number): Promise<{ deleted: true; id: number }> {
    await this.ensureExists(id);
    try {
      await this.prisma.site.delete({ where: { id } });
      return { deleted: true, id };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException({
          message:
            'Site cannot be deleted because related assignments or incidents exist. Archive it instead by setting active=false.',
          siteId: id,
        });
      }
      throw new HttpException(
        {
          message: 'Failed to delete site',
          cause: err instanceof Error ? err.message : String(err),
        },
        500,
      );
    }
  }

  async verify(id: number): Promise<SiteVerificationEntity> {
    const row = await this.prisma.site.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException({
        message: `Site ${id} not found`,
        siteId: id,
      });
    }
    return {
      ok: row.active === true,
      siteId: row.id,
      name: row.name,
      active: row.active,
      code: row.code,
      region: row.region,
      verifiedAt: new Date().toISOString(),
    };
  }

  private async ensureExists(id: number): Promise<void> {
    const count = await this.prisma.site.count({ where: { id } });
    if (count === 0) {
      throw new NotFoundException({
        message: `Site ${id} not found`,
        siteId: id,
      });
    }
  }
}

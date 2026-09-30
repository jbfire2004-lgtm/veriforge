import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSiteContactDto } from './dto/create-site-contact.dto';
import { QuerySiteContactDto } from './dto/query-site-contact.dto';
import { UpdateSiteContactDto } from './dto/update-site-contact.dto';
import {
  SiteContactsPaginatedEntity,
  SiteContactResponseEntity,
  toSiteContactResponse,
} from './entities/site-contact.entity';

@Injectable()
export class SiteContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPage(
    query: QuerySiteContactDto,
  ): Promise<SiteContactsPaginatedEntity> {
    const page = query.page ?? 1;
    const pageSize = query.limit ?? 20;
    const skip = (page - 1) * pageSize;
    const search = query.search?.trim();

    const parts: Prisma.SiteContactWhereInput[] = [];
    if (query.siteId != null) {
      parts.push({ siteId: query.siteId });
    }
    if (search && search.length > 0) {
      parts.push({
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { role: { contains: search, mode: 'insensitive' } },
        ],
      });
    }
    const where: Prisma.SiteContactWhereInput =
      parts.length === 0 ? {} : { AND: parts };

    try {
      const [rows, total] = await this.prisma.$transaction([
        this.prisma.siteContact.findMany({
          where,
          orderBy: [{ isPrimary: 'desc' }, { fullName: 'asc' }],
          skip,
          take: pageSize,
        }),
        this.prisma.siteContact.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        data: rows.map(toSiteContactResponse),
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Failed to list site contacts',
        cause: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async findOne(id: number): Promise<SiteContactResponseEntity> {
    const row = await this.prisma.siteContact.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException({
        message: `Site contact ${id} not found`,
        id,
      });
    }
    return toSiteContactResponse(row);
  }

  async create(dto: CreateSiteContactDto): Promise<SiteContactResponseEntity> {
    await this.ensureSiteExists(dto.siteId);

    try {
      const row = await this.prisma.$transaction(async (tx) => {
        if (dto.isPrimary === true) {
          await tx.siteContact.updateMany({
            where: { siteId: dto.siteId },
            data: { isPrimary: false },
          });
        }

        return tx.siteContact.create({
          data: {
            siteId: dto.siteId,
            fullName: dto.fullName.trim(),
            email: dto.email?.trim() ?? null,
            phone: dto.phone?.trim() ?? null,
            role: dto.role?.trim() ?? null,
            isPrimary: dto.isPrimary ?? false,
          },
        });
      });

      return toSiteContactResponse(row);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException({
          message: 'Invalid site reference',
          siteId: dto.siteId,
        });
      }
      throw new InternalServerErrorException({
        message: 'Failed to create site contact',
        cause: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async update(
    id: number,
    dto: UpdateSiteContactDto,
  ): Promise<SiteContactResponseEntity> {
    const existing = await this.prisma.siteContact.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException({
        message: `Site contact ${id} not found`,
        id,
      });
    }

    try {
      const row = await this.prisma.$transaction(async (tx) => {
        if (dto.isPrimary === true) {
          await tx.siteContact.updateMany({
            where: { siteId: existing.siteId, NOT: { id } },
            data: { isPrimary: false },
          });
        }

        return tx.siteContact.update({
          where: { id },
          data: {
            ...(dto.fullName !== undefined && {
              fullName: dto.fullName.trim(),
            }),
            ...(dto.email !== undefined && {
              email: dto.email?.trim() ?? null,
            }),
            ...(dto.phone !== undefined && {
              phone: dto.phone?.trim() ?? null,
            }),
            ...(dto.role !== undefined && { role: dto.role?.trim() ?? null }),
            ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
          },
        });
      });

      return toSiteContactResponse(row);
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Failed to update site contact',
        cause: err instanceof Error ? err.message : String(err),
      });
    }
  }

  async remove(id: number): Promise<{ deleted: true; id: number }> {
    const existing = await this.prisma.siteContact.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException({
        message: `Site contact ${id} not found`,
        id,
      });
    }
    await this.prisma.siteContact.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async ensureSiteExists(siteId: number): Promise<void> {
    const n = await this.prisma.site.count({ where: { id: siteId } });
    if (n === 0) {
      throw new NotFoundException({
        message: `Site ${siteId} not found`,
        siteId,
      });
    }
  }
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  BaseRepository,
  type PaginatedResult,
  type PaginationParams,
} from './base.repository';

@Injectable()
export class EquipmentRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: number) {
    return this.prisma.equipment.findUnique({
      where: { id },
      include: { company: true },
    });
  }

  async list(
    where: Prisma.EquipmentWhereInput,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<unknown>> {
    const { skip, take } = this.paginate(
      pagination?.page,
      pagination?.pageSize,
    );
    const [items, total] = await Promise.all([
      this.prisma.equipment.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.equipment.count({ where }),
    ]);
    return { items, total, page: pagination?.page ?? 1, pageSize: take };
  }
}

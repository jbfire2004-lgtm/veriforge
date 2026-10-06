import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  BaseRepository,
  type PaginatedResult,
  type PaginationParams,
} from './base.repository';

@Injectable()
export class WorkerRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: number) {
    return this.prisma.worker.findUnique({
      where: { id },
      include: {
        company: true,
        trainingRecords: { include: { certification: true }, take: 50 },
      },
    });
  }

  async search(
    where: Prisma.WorkerWhereInput,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<unknown>> {
    const { skip, take } = this.paginate(
      pagination?.page,
      pagination?.pageSize,
    );
    const [items, total] = await Promise.all([
      this.prisma.worker.findMany({
        where,
        skip,
        take,
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: { company: true },
      }),
      this.prisma.worker.count({ where }),
    ]);
    return {
      items,
      total,
      page: pagination?.page ?? 1,
      pageSize: take,
    };
  }
}

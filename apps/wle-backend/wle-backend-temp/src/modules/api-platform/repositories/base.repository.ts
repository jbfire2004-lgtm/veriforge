import { PrismaService } from '../../../prisma/prisma.service';

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export abstract class BaseRepository {
  constructor(protected readonly prisma: PrismaService) {}

  protected paginate(page = 1, pageSize = 25): { skip: number; take: number } {
    const p = Math.max(1, page);
    const size = Math.min(100, Math.max(1, pageSize));
    return { skip: (p - 1) * size, take: size };
  }
}

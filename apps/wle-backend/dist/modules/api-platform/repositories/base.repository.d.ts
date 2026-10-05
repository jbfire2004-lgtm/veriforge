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
export declare abstract class BaseRepository {
    protected readonly prisma: PrismaService;
    constructor(prisma: PrismaService);
    protected paginate(page?: number, pageSize?: number): {
        skip: number;
        take: number;
    };
}

import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository } from './base.repository';
export declare class ProjectRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    findById(id: number): import(".prisma/client").Prisma.Prisma__ProjectClient<{
        company: {
            id: number;
            name: string;
            logoUrl: string | null;
            city: string | null;
            province: string | null;
            industry: string | null;
            lat: number | null;
            lng: number | null;
            createdAt: Date;
        };
    } & {
        id: number;
        companyId: number;
        siteId: number | null;
        name: string;
        code: string | null;
        client: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        startDate: Date | null;
        endDate: Date | null;
        createdAt: Date;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    close(id: number): import(".prisma/client").Prisma.Prisma__ProjectClient<{
        id: number;
        companyId: number;
        siteId: number | null;
        name: string;
        code: string | null;
        client: string | null;
        status: import(".prisma/client").$Enums.ProjectStatus;
        startDate: Date | null;
        endDate: Date | null;
        createdAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}

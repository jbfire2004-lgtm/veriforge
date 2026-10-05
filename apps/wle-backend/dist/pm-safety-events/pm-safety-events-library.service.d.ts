import { PrismaService } from '../prisma/prisma.service';
export declare class PmSafetyEventsLibraryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    ensureLibraries(companyId: number): Promise<void>;
    rootCauses(companyId: number): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        companyId: number;
        code: string;
        label: string;
        category: string | null;
        description: string | null;
        active: boolean;
        createdAt: Date;
    }[]>;
    contributingFactors(companyId: number): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        companyId: number;
        code: string;
        label: string;
        category: string | null;
        active: boolean;
        createdAt: Date;
    }[]>;
}

import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
export declare class StandardsCatalogService implements OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    seedIfEmpty(): Promise<void>;
    listStandards(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        code: string;
        title: string;
        kind: import(".prisma/client").$Enums.TrainingStandardKind;
        jurisdictionCode: string | null;
        description: string | null;
        keywords: string[];
        defaultValidityDays: number | null;
        active: boolean;
        createdAt: Date;
    }[]>;
    listRejectionReasons(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        code: string;
        title: string;
        description: string | null;
        severity: import(".prisma/client").$Enums.TrainingRejectionSeverity;
        category: import(".prisma/client").$Enums.TrainingRejectionCategory;
        active: boolean;
    }[]>;
}

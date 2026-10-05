import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
export declare class RegulatoryEquivalencyService implements OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    seedIfEmpty(): Promise<void>;
    resolveJurisdictionCoverage(sourceJurisdiction: string, matchedStandardCodes: string[]): Promise<string[]>;
    listActive(): Promise<{
        id: number;
        fromJurisdiction: string;
        toJurisdiction: string;
        standardCode: string;
        notes: string | null;
        active: boolean;
        createdAt: Date;
    }[]>;
}

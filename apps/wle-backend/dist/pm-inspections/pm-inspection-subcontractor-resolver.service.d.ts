import { PmInspectionFindingCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class PmInspectionSubcontractorResolverService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listSubcontractorIds(projectId: number): Promise<number[]>;
    resolveForFinding(projectId: number, category: PmInspectionFindingCategory, overrideId?: number): Promise<number | undefined>;
    listWithNames(projectId: number): Promise<{
        id: number;
        name: string;
    }[]>;
}

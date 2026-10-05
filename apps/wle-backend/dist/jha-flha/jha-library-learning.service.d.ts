import { PrismaService } from '../prisma/prisma.service';
export type ProjectLearningItem = {
    description: string;
    category?: string;
    controlType?: string;
    count: number;
    reason: string;
};
export type ProjectLearnings = {
    hazards: ProjectLearningItem[];
    controls: ProjectLearningItem[];
    approvedFormCount: number;
};
export declare class JhaLibraryLearningService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProjectLearnings(projectId: number, limit?: number): Promise<ProjectLearnings>;
    promoteFromApprovedJha(jhaFlhaId: string): Promise<{
        hazardsAdded: number;
        controlsAdded: number;
    }>;
}

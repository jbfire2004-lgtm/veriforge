import { PrismaService } from '../../prisma/prisma.service';
import { VeriAgentService } from '../../veri-agent/veri-agent.service';
export type EmbeddingCluster = {
    clusterId: string;
    label: string;
    count: number;
    similarity: number;
    lessonIds: string[];
    meetingTopics: string[];
};
export declare class LessonEmbeddingService {
    private readonly prisma;
    private readonly veriAgent;
    private readonly logger;
    constructor(prisma: PrismaService, veriAgent: VeriAgentService);
    tokenize(text: string): string[];
    vectorize(text: string): Map<string, number>;
    cosine(a: Map<string, number>, b: Map<string, number>): number;
    embedLesson(lessonId: string): Promise<{
        lessonId: string;
        model: string;
    }>;
    reclusterProject(projectId: number, threshold?: number): Promise<{
        projectId: number;
        clusters: EmbeddingCluster[];
        lessonCount: number;
    }>;
    private similarity;
}

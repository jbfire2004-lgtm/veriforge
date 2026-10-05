import { PrismaService } from '../prisma/prisma.service';
export type TrainingGap = {
    trainingCode: string;
    courseName: string;
    reason: string;
    status: 'missing' | 'expired';
};
export declare class WorkerTrainingEngine {
    private readonly prisma;
    constructor(prisma: PrismaService);
    syncFromRecords(workerId: number, profileId?: string): Promise<void>;
    gapsFromMatrix(required: Array<{
        trainingCode: string;
        trainingName: string;
    }>, held: Array<{
        trainingCode: string;
        status: string;
    }>): TrainingGap[];
}

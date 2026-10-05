import { PrismaService } from '../../prisma/prisma.service';
import { CailEmitterService } from '../cail/cail-emitter.service';
export type BackfillResult = {
    scanned: number;
    created: number;
    linked: number;
    skipped: number;
    skippedReasons: Record<string, number>;
};
export declare class CoreActionCailBackfillService {
    private readonly prisma;
    private readonly emitter;
    private readonly logger;
    constructor(prisma: PrismaService, emitter: CailEmitterService);
    backfillFromSafetyFormActions(opts?: {
        dryRun?: boolean;
        limit?: number;
    }): Promise<BackfillResult>;
    private resolveSourceType;
    private mapSeverity;
    private mapStatus;
}

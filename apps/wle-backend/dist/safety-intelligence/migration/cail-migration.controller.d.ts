import { CoreActionCailBackfillService } from './core-action-cail-backfill.service';
declare class BackfillBodyDto {
    dryRun?: boolean;
    limit?: number;
}
export declare class CailMigrationController {
    private readonly backfill;
    constructor(backfill: CoreActionCailBackfillService);
    backfillCoreActions(body: BackfillBodyDto): Promise<import("./core-action-cail-backfill.service").BackfillResult>;
}
export {};

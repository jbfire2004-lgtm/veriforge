import { PrismaService } from '../../prisma/prisma.service';
import { CredentialLedgerService } from './credential-ledger.service';
export type LedgerBackfillResult = {
    dryRun: boolean;
    scanned: number;
    recordsBackfilled: number;
    recordsSkipped: number;
    eventsCreated: number;
    errors: Array<{
        credentialId: number;
        message: string;
    }>;
};
export declare class CredentialLedgerBackfillService {
    private readonly prisma;
    private readonly ledger;
    private readonly logger;
    constructor(prisma: PrismaService, ledger: CredentialLedgerService);
    backfill(options?: {
        companyId?: number;
        limit?: number;
        dryRun?: boolean;
    }): Promise<LedgerBackfillResult>;
    private planEventsForRecord;
}

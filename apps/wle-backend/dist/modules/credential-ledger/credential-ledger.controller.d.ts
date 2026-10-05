import { Request } from 'express';
import { AuditLogService } from '../../audit/audit-log.service';
import { CredentialLedgerChainService } from './credential-ledger-chain.service';
import { CredentialLedgerBackfillService } from './credential-ledger-backfill.service';
import { CredentialLedgerBackfillDto } from './dto/credential-ledger-backfill.dto';
type AuthReq = Request & {
    user?: {
        id: number;
        companyId?: number | null;
    };
};
export declare class CredentialLedgerController {
    private readonly chain;
    private readonly backfill;
    private readonly audit;
    constructor(chain: CredentialLedgerChainService, backfill: CredentialLedgerBackfillService, audit: AuditLogService);
    runBackfill(body: CredentialLedgerBackfillDto, req: AuthReq): Promise<import("./credential-ledger-backfill.service").LedgerBackfillResult>;
    verificationChain(credentialId: number): Promise<import("./credential-ledger.types").VerificationChainResponse>;
}
export {};

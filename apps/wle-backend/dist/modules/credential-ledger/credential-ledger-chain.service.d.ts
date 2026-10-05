import { CredentialLedgerEventType, TrainingValidationOutcome } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CredentialLedgerService } from './credential-ledger.service';
import type { CredentialLifecycleStatus, VerificationChainResponse } from './credential-ledger.types';
export declare class CredentialLedgerChainService {
    private readonly prisma;
    private readonly ledger;
    constructor(prisma: PrismaService, ledger: CredentialLedgerService);
    resolveVerificationChain(credentialId: number): Promise<VerificationChainResponse>;
    resolveStatus(record: {
        expiresAt: Date | null;
        lastVerificationStatus: string | null;
    }, events: Array<{
        eventType: CredentialLedgerEventType;
    }>, latestValidation: TrainingValidationOutcome | null): CredentialLifecycleStatus;
}

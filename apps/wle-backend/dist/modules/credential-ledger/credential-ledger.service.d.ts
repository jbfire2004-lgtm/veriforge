import { PrismaService } from '../../prisma/prisma.service';
import type { CredentialLedgerEventView, LedgerAppendInput, RecordCredentialContext } from './credential-ledger.types';
export declare class CredentialLedgerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    append(input: LedgerAppendInput): Promise<CredentialLedgerEventView>;
    recordCredentialCreated(ctx: RecordCredentialContext): Promise<CredentialLedgerEventView>;
    recordCredentialImported(ctx: RecordCredentialContext): Promise<CredentialLedgerEventView>;
    recordCredentialUpdated(ctx: RecordCredentialContext): Promise<CredentialLedgerEventView>;
    recordCredentialCorrected(ctx: RecordCredentialContext): Promise<CredentialLedgerEventView>;
    recordCredentialVerified(ctx: RecordCredentialContext): Promise<CredentialLedgerEventView>;
    recordCredentialRevoked(ctx: RecordCredentialContext): Promise<CredentialLedgerEventView>;
    recordCredentialExpired(ctx: RecordCredentialContext): Promise<CredentialLedgerEventView>;
    listByCredential(credentialId: number, limit?: number): Promise<CredentialLedgerEventView[]>;
    assertImmutableOperation(model: string | undefined, action: string): void;
    private toView;
}

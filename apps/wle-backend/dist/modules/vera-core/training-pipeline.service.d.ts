import { PrismaService } from '../../prisma/prisma.service';
import { CompanyLinksService } from './company-links.service';
import { TrainingWalletIntegrationService } from './training-wallet-integration.service';
import { CredentialLedgerService } from '../credential-ledger/credential-ledger.service';
export interface TrainingIngestInput {
    workerId?: number;
    workerEmail?: string;
    workerPhone?: string;
    equipmentId?: number;
    companyId?: number;
    projectId?: number;
    certificationId: number;
    providerId?: number;
    trainingProviderId?: number;
    courseId?: number;
    instructorId?: number;
    expiresAt?: Date;
    issuedAt?: Date;
    certificateNumber?: string;
    ingestionRunId?: number;
}
export declare class TrainingPipelineService {
    private readonly prisma;
    private readonly companyLinks;
    private readonly walletIntegration;
    private readonly credentialLedger;
    constructor(prisma: PrismaService, companyLinks: CompanyLinksService, walletIntegration: TrainingWalletIntegrationService, credentialLedger: CredentialLedgerService);
    ingest(input: TrainingIngestInput): Promise<{
        ok: boolean;
        error: string;
        workerId?: undefined;
        trainingRecord?: undefined;
        walletTraining?: undefined;
    } | {
        ok: boolean;
        workerId: number;
        trainingRecord: {
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
        } & {
            id: number;
            workerId: number;
            certificationId: number;
            providerId: number | null;
            trainingProviderId: number | null;
            courseId: number | null;
            instructorId: number | null;
            companyId: number | null;
            projectId: number | null;
            expiresAt: Date | null;
            issuedAt: Date;
            certificateNumber: string | null;
            certificateUrl: string | null;
            certificateQrToken: string | null;
            certificateSignedAt: Date | null;
            certificateSignedByInstructorId: number | null;
            completedAt: Date | null;
            lastVerificationStatus: string | null;
            lastVerificationChecks: import(".prisma/client").Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        };
        walletTraining: import("./training-wallet.mapper").WalletTrainingRecordDto;
        error?: undefined;
    }>;
    private resolveWorkerId;
}

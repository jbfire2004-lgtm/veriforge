import { TrainingValidationOutcome } from '@prisma/client';
export type WalletTrainingRecordDto = {
    id: number;
    issuedAt: Date;
    expiresAt: Date | null;
    completedAt: Date | null;
    certification: {
        id: number;
        name: string;
        code: string | null;
    } | null;
    providerName: string | null;
    instructorName: string | null;
    courseName: string | null;
    courseCode: string | null;
    courseStandards: string[];
    jurisdictionCode: string | null;
    jurisdictionValid: boolean | null;
    certificateQrToken: string | null;
    certificateQrUrl: string | null;
    certificateNumber: string | null;
    complianceStatus: string;
    companyId: number | null;
    projectId: number | null;
    projectName: string | null;
    companyName: string | null;
    verifiedByVeraStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'VERIFIED_WITH_NFT';
    jurisdictionCoverage?: string[];
    regulatorySummary?: string | null;
    nftTokenId?: string | null;
    nftChain?: string | null;
};
type TrainingRecordWithRelations = {
    id: number;
    issuedAt: Date;
    expiresAt: Date | null;
    completedAt: Date | null;
    certificateQrToken: string | null;
    certificateNumber: string | null;
    companyId: number | null;
    projectId: number | null;
    certification: {
        id: number;
        name: string;
        code: string | null;
    };
    trainingProvider: {
        name: string;
    } | null;
    instructor: {
        firstName: string;
        lastName: string;
    } | null;
    course: {
        name: string;
        code: string;
        standards: {
            standardKey: string;
        }[];
    } | null;
    company: {
        name: string;
    } | null;
    project: {
        name: string;
        site: {
            region: string | null;
        } | null;
    } | null;
};
export declare function mapTrainingRecordForWallet(record: TrainingRecordWithRelations, options?: {
    validationOutcome?: TrainingValidationOutcome | null;
    jurisdictionCode?: string | null;
    baseUrl?: string;
    verifiedByVeraStatus?: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'VERIFIED_WITH_NFT';
    jurisdictionCoverage?: string[];
    regulatorySummary?: string | null;
    nftTokenId?: string | null;
    nftChain?: string | null;
}): WalletTrainingRecordDto;
export declare const TRAINING_RECORD_WALLET_INCLUDE: {
    readonly certification: true;
    readonly trainingProvider: true;
    readonly instructor: true;
    readonly course: {
        readonly include: {
            readonly standards: true;
        };
    };
    readonly company: true;
    readonly project: {
        readonly include: {
            readonly site: true;
        };
    };
};
export {};

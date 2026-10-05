import { PrismaService } from '../../prisma/prisma.service';
export interface DigitalCertificatePayload {
    recordId: number;
    workerId: number;
    workerName: string;
    certificationName: string;
    courseName?: string;
    providerName: string;
    issuedAt: string;
    expiresAt?: string;
    certificateNumber?: string;
    verificationUrl: string;
}
export declare class TrainingProviderCertificateService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    newQrToken(): string;
    verificationPath(token: string): string;
    apiValidationPath(token: string): string;
    buildDigitalCertificate(recordId: number): Promise<DigitalCertificatePayload | null>;
    generateQrDataUrl(recordId: number): Promise<string | null>;
    validateByToken(token: string): Promise<{
        valid: boolean;
        reason: string;
        expired?: undefined;
        record?: undefined;
    } | {
        valid: boolean;
        expired: boolean;
        record: {
            id: number;
            workerId: number;
            workerName: string;
            certification: string;
            course: string;
            provider: string;
            instructor: string;
            issuedAt: Date;
            expiresAt: Date;
            certificateNumber: string;
            certificateUrl: string;
        };
        reason?: undefined;
    }>;
    private ensureQrToken;
}

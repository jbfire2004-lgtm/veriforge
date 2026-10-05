import { CombinedService } from '../combined/combined.service';
import { VerificationService } from '../verification/verification.service';
import { PublicTokenResolver } from '../verification/public-token.resolver';
import type { QrScanDto } from './dto/qr-scan.dto';
import { TrainingProviderCertificateService } from '../modules/training-provider-core/training-provider-certificate.service';
export declare class QrService {
    private combined;
    private verify;
    private readonly trainingCertificates;
    private readonly publicTokens;
    constructor(combined: CombinedService, verify: VerificationService, trainingCertificates: TrainingProviderCertificateService, publicTokens: PublicTokenResolver);
    generateWorkerQr(workerId: number): Promise<{
        type: string;
        workerId: number;
        qrToken: string;
        content: string;
        verifyUrl: string;
        json: {
            type: string;
            token: string;
            id: number;
        };
    }>;
    generateEquipmentQr(equipmentId: number): Promise<{
        type: string;
        equipmentId: number;
        qrToken: string;
        content: string;
        verifyUrl: string;
        json: {
            type: string;
            token: string;
            id: number;
        };
    }>;
    generateCombinedQr(workerId: number, equipmentId: number): {
        type: string;
        workerId: number;
        equipmentId: number;
        content: string;
        legacy: boolean;
    };
    parseAndVerify(dto: QrScanDto): Promise<unknown>;
    private parseAndVerifyInner;
    private extractPublicTokenFromUrl;
}

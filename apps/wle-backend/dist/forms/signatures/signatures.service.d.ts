import { SafetyFormSignatureRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class SafetyFormSignaturesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    capture(formId: string, input: {
        fieldId?: string;
        role?: SafetyFormSignatureRole;
        signerName?: string;
        signerUserId?: number;
        signatureData: string;
    }): Promise<{
        id: string;
        formId: string;
        fieldId: string | null;
        role: import(".prisma/client").$Enums.SafetyFormSignatureRole;
        signerName: string | null;
        signerUserId: number | null;
        signatureData: string;
        signedAt: Date;
    }>;
    list(formId: string): Promise<{
        id: string;
        formId: string;
        fieldId: string | null;
        role: import(".prisma/client").$Enums.SafetyFormSignatureRole;
        signerName: string | null;
        signerUserId: number | null;
        signatureData: string;
        signedAt: Date;
    }[]>;
}

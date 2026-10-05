import type { RequiredSignatureDef } from './pm-inspection-signature.constants';
export type SignatureRecord = {
    role: string;
    signatureData?: string | null;
    coreFileId?: number | null;
};
export declare function parseRequiredSignatures(raw: unknown): RequiredSignatureDef[];
export declare function missingRequiredSignatureRoles(required: RequiredSignatureDef[], existing: SignatureRecord[]): string[];
export declare function signatureHasImage(data: SignatureRecord): boolean;
export declare function assertEditableInspectionStatus(status: string): void;
export declare function assertSignatureRoleAllowed(role: string, required: RequiredSignatureDef[]): void;
export declare function assertSignaturePayload(data: {
    role?: string;
    signatureData?: string;
    coreFileId?: number;
}, required: RequiredSignatureDef[]): {
    role: string;
    signatureData?: string;
    coreFileId?: number;
};
export declare function assertAllRequiredSignaturesPresent(required: RequiredSignatureDef[], existing: SignatureRecord[]): void;

import type { OrientationContentBlock } from './orientation.types';
export declare const ORIENTATION_BLOCK_TYPES: readonly ["slide", "text", "video", "quiz", "policy_ack"];
export declare const ORIENTATION_UPLOAD_MAX_BYTES: number;
export declare const ORIENTATION_UPLOAD_ALLOWED_MIME: Set<string>;
export declare const ORIENTATION_NEAR_EXPIRY_DAYS = 30;
export declare function bumpMinorVersion(version: string): string;
export declare function computeExpiresOn(completedOn: Date, rules: {
    durationDays?: number;
} | null | undefined): Date | null;
export declare function isNearExpiry(expiresOn: Date | null | undefined, now?: Date, withinDays?: number): boolean;
export declare function normalizeAndValidateBlocks(blocks: unknown): OrientationContentBlock[];
export declare function assertOrientationUploadFile(file: {
    mimetype?: string;
    size?: number;
    originalname?: string;
}): void;
export declare function buildSecureOrientationObjectKey(input: {
    companyId: number;
    originalName: string;
    now?: Date;
}): string;

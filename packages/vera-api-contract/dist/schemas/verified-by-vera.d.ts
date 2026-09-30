import { z } from 'zod';
export declare const VerifiedByVeraStatusSchema: z.ZodEnum<["UNVERIFIED", "PENDING", "VERIFIED", "VERIFIED_WITH_NFT"]>;
/** UI-facing status (lowercase aliases). */
export declare const VerifiedByVeraBadgeStatusSchema: z.ZodEnum<["unverified", "pending", "verified", "verified_with_nft"]>;
export declare const VerifiedByVeraProjectionSchema: z.ZodObject<{
    trainingRecordId: z.ZodNumber;
    verifiedByVeraStatus: z.ZodEnum<["UNVERIFIED", "PENDING", "VERIFIED", "VERIFIED_WITH_NFT"]>;
    jurisdictionCoverage: z.ZodArray<z.ZodString, "many">;
    regulatorySummary: z.ZodNullable<z.ZodString>;
    nftTokenId: z.ZodNullable<z.ZodString>;
    nftChain: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    trainingRecordId: number;
    jurisdictionCoverage: string[];
    verifiedByVeraStatus: "PENDING" | "UNVERIFIED" | "VERIFIED" | "VERIFIED_WITH_NFT";
    regulatorySummary: string | null;
    nftTokenId: string | null;
    nftChain: string | null;
}, {
    trainingRecordId: number;
    jurisdictionCoverage: string[];
    verifiedByVeraStatus: "PENDING" | "UNVERIFIED" | "VERIFIED" | "VERIFIED_WITH_NFT";
    regulatorySummary: string | null;
    nftTokenId: string | null;
    nftChain: string | null;
}>;
export type VerifiedByVeraStatus = z.infer<typeof VerifiedByVeraStatusSchema>;
export type VerifiedByVeraBadgeStatus = z.infer<typeof VerifiedByVeraBadgeStatusSchema>;
export type VerifiedByVeraProjection = z.infer<typeof VerifiedByVeraProjectionSchema>;
export declare function toBadgeStatus(status: VerifiedByVeraStatus): VerifiedByVeraBadgeStatus;

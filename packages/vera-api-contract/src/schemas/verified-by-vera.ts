import { z } from 'zod';

export const VerifiedByVeraStatusSchema = z.enum([
  'UNVERIFIED',
  'PENDING',
  'VERIFIED',
  'VERIFIED_WITH_NFT',
]);

/** UI-facing status (lowercase aliases). */
export const VerifiedByVeraBadgeStatusSchema = z.enum([
  'unverified',
  'pending',
  'verified',
  'verified_with_nft',
]);

export const VerifiedByVeraProjectionSchema = z.object({
  trainingRecordId: z.number().int(),
  verifiedByVeraStatus: VerifiedByVeraStatusSchema,
  jurisdictionCoverage: z.array(z.string()),
  regulatorySummary: z.string().nullable(),
  nftTokenId: z.string().nullable(),
  nftChain: z.string().nullable(),
});

export type VerifiedByVeraStatus = z.infer<typeof VerifiedByVeraStatusSchema>;
export type VerifiedByVeraBadgeStatus = z.infer<
  typeof VerifiedByVeraBadgeStatusSchema
>;
export type VerifiedByVeraProjection = z.infer<
  typeof VerifiedByVeraProjectionSchema
>;

export function toBadgeStatus(
  status: VerifiedByVeraStatus,
): VerifiedByVeraBadgeStatus {
  switch (status) {
    case 'VERIFIED_WITH_NFT':
      return 'verified_with_nft';
    case 'VERIFIED':
      return 'verified';
    case 'PENDING':
      return 'pending';
    default:
      return 'unverified';
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifiedByVeraProjectionSchema = exports.VerifiedByVeraBadgeStatusSchema = exports.VerifiedByVeraStatusSchema = void 0;
exports.toBadgeStatus = toBadgeStatus;
const zod_1 = require("zod");
exports.VerifiedByVeraStatusSchema = zod_1.z.enum([
    'UNVERIFIED',
    'PENDING',
    'VERIFIED',
    'VERIFIED_WITH_NFT',
]);
/** UI-facing status (lowercase aliases). */
exports.VerifiedByVeraBadgeStatusSchema = zod_1.z.enum([
    'unverified',
    'pending',
    'verified',
    'verified_with_nft',
]);
exports.VerifiedByVeraProjectionSchema = zod_1.z.object({
    trainingRecordId: zod_1.z.number().int(),
    verifiedByVeraStatus: exports.VerifiedByVeraStatusSchema,
    jurisdictionCoverage: zod_1.z.array(zod_1.z.string()),
    regulatorySummary: zod_1.z.string().nullable(),
    nftTokenId: zod_1.z.string().nullable(),
    nftChain: zod_1.z.string().nullable(),
});
function toBadgeStatus(status) {
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

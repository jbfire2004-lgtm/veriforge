import { describe, expect, it } from "vitest";
import {
  badgeFieldsFromProjection,
  mapWalletVerifiedStatus,
} from "@/src/services/regulatoryVerificationClient";

describe("regulatoryVerificationClient", () => {
  it("maps projection to badge fields with hasNft", () => {
    const fields = badgeFieldsFromProjection({
      trainingRecordId: 1,
      verifiedByVeraStatus: "VERIFIED_WITH_NFT",
      jurisdictionCoverage: ["ON"],
      regulatorySummary: "OK",
      nftTokenId: "tok-1",
      nftChain: "vera-stub",
    });
    expect(fields.verificationStatus).toBe("verified_with_nft");
    expect(fields.hasNft).toBe(true);
    expect(fields.nftTokenId).toBe("tok-1");
  });

  it("returns undefined for unverified wallet status", () => {
    expect(mapWalletVerifiedStatus("UNVERIFIED")).toBeUndefined();
    expect(mapWalletVerifiedStatus(null)).toBeUndefined();
  });

  it("maps verified wallet status", () => {
    const fields = mapWalletVerifiedStatus("VERIFIED");
    expect(fields?.verificationStatus).toBe("verified");
    expect(fields?.hasNft).toBe(false);
  });
});

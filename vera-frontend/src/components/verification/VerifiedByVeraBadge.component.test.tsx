import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { VerifiedByVeraBadge } from "@/src/components/verification/VerifiedByVeraBadge";

vi.mock("@/lib/training-credential-nft/api", () => ({
  fetchVerifiedByVeraProjection: vi.fn(),
}));

import { fetchVerifiedByVeraProjection } from "@/lib/training-credential-nft/api";

const mockFetch = vi.mocked(fetchVerifiedByVeraProjection);

describe("VerifiedByVeraBadge", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders nothing when unverified by default", () => {
    const { container } = render(<VerifiedByVeraBadge status="unverified" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders subtle unverified when showUnverified is true", () => {
    render(<VerifiedByVeraBadge status="unverified" showUnverified />);
    expect(screen.getByText("Not verified")).toBeInTheDocument();
  });

  it("renders pending label and tooltip", () => {
    const { container } = render(
      <VerifiedByVeraBadge
        status="pending"
        regulatorySummary="Regulatory review"
        jurisdictionCoverage={["ON", "AB"]}
      />,
    );
    expect(screen.getByText("Verification pending")).toBeInTheDocument();
    const badge = container.querySelector("span[title]");
    expect(badge?.getAttribute("title")).toContain("OHS/CSA");
    expect(badge?.getAttribute("title")).toContain("ON");
  });

  it("renders verified by Vera", () => {
    const { container } = render(<VerifiedByVeraBadge status="verified" />);
    expect(screen.getByText("Verified by Vera")).toBeInTheDocument();
    const badge = container.querySelector("span[title]");
    expect(badge?.getAttribute("title")).toContain("OHS/CSA");
  });

  it("renders verified_with_nft and NFT tooltip", () => {
    const { container } = render(
      <VerifiedByVeraBadge
        status="verified_with_nft"
        hasNft
        jurisdictionCoverage={["ON"]}
      />,
    );
    const badge = container.querySelector("span[title]");
    expect(badge?.getAttribute("title")).toContain("NFT-locked credential");
    expect(badge?.querySelector("[aria-label='NFT-locked']")).toBeTruthy();
  });

  it("fetches projection when trainingRecordId is provided", async () => {
    mockFetch.mockResolvedValue({
      trainingRecordId: 42,
      verifiedByVeraStatus: "VERIFIED",
      jurisdictionCoverage: ["ON"],
      regulatorySummary: "Compliant",
      nftTokenId: null,
      nftChain: null,
    });
    render(<VerifiedByVeraBadge trainingRecordId={42} />);
    expect(await screen.findByText("Verified by Vera")).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith(42);
  });
});

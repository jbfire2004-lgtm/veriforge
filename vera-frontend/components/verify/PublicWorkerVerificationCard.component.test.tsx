import { describe, expect, it, afterEach, vi, beforeEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { PublicWorkerVerificationCard } from "@/components/verify/PublicWorkerVerificationCard";

vi.mock("@/components/wallet/wallet-api", () => ({
  loadWorkerWallet: vi.fn(),
}));

import { loadWorkerWallet } from "@/components/wallet/wallet-api";

const mockLoad = vi.mocked(loadWorkerWallet);

const sampleData = {
  ok: true as const,
  data: {
    payload: {
      worker: { id: 12, firstName: "Alex", lastName: "Rivera", company: { id: 1, name: "Acme" } },
      certifications: [],
      credentials: [],
      expiredCerts: [],
      compliance: { isCompliant: true, issues: [] },
    },
    history: null,
    historyError: "Sign-in history is not shown on public verification.",
  },
};

describe("PublicWorkerVerificationCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoad.mockResolvedValue(sampleData);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders public verification card for numeric worker id", async () => {
    render(<PublicWorkerVerificationCard workerId="12" />);
    await waitFor(() => expect(mockLoad).toHaveBeenCalledWith("12"));
    expect(screen.getByTestId("public-worker-verify-card")).toBeInTheDocument();
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
  });
});

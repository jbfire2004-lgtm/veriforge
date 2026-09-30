import { describe, expect, it } from "vitest";
import {
  isSupervisorSignatureRole,
  isWorkerSignatureRole,
  signaturePreviewUrl,
} from "./inspection-signatures";

describe("inspection-signatures", () => {
  it("classifies supervisor and worker roles", () => {
    expect(isSupervisorSignatureRole("supervisor")).toBe(true);
    expect(isWorkerSignatureRole("worker")).toBe(true);
    expect(isWorkerSignatureRole("supervisor")).toBe(false);
  });

  it("resolves preview URL from core file or data URL", () => {
    expect(
      signaturePreviewUrl({
        coreFile: { publicUrl: "https://cdn/sig.png" },
        signatureData: "data:image/png;base64,x",
      }),
    ).toBe("https://cdn/sig.png");

    expect(
      signaturePreviewUrl({
        signatureData: "data:image/png;base64,abc",
      }),
    ).toBe("data:image/png;base64,abc");
  });
});

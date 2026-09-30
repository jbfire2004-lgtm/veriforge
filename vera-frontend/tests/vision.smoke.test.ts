import { describe, expect, it } from "vitest";
import { VeraVisionEngine } from "@vera/vision";

const SAMPLE_CERT = `
Training Certificate
Participant: John Smith
Course: Fall Protection Awareness
Provider: Northern Safety Training Ltd
Instructor: Jane Doe
Issue Date: 2024-01-15
Expiry Date: 2027-01-15
Certificate #: CPT-2024-9912
CSA Z462 Electrical Safety
Signed by instructor
`;

describe("Vera Vision Engine", () => {
  it("extracts certificate fields and maps standards", async () => {
    const vve = new VeraVisionEngine();
    const result = await vve.analyzeCertificate({
      ocrText: SAMPLE_CERT,
      candidates: {
        workers: [{ id: "1", name: "John Smith" }],
        providers: [{ id: "2", name: "Northern Safety Training" }],
      },
    });
    expect(result.fields.some((f) => f.key === "workerName")).toBe(true);
    expect(result.validation.standards.length).toBeGreaterThan(0);
    expect(result.mappings.some((m) => m.entityType === "worker")).toBe(true);
  });

  it("flags fraud on invalid dates", async () => {
    const vve = new VeraVisionEngine();
    const result = await vve.analyze({
      documentType: "training_certificate",
      ocrText: "Issue Date: 2025-06-01\nExpiry Date: 2024-01-01\nParticipant: Test Sample",
    });
    expect(result.fraud.signals.some((s) => s.code === "INVALID_DATES")).toBe(true);
  });
});

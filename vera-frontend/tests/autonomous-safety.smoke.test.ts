import { describe, expect, it } from "vitest";
import { VeraAutonomousSafetyEngine } from "@vera/autonomous-safety";

describe("Vera Autonomous Safety Engine", () => {
  it("analyzes SIF precursors from safety forms", () => {
    const vase = new VeraAutonomousSafetyEngine();
    const report = vase.analyze({
      companyId: "1",
      forms: [
        {
          id: "1",
          kind: "SIF",
          title: "Roof work",
          hazardSummary: "Fall from height on ladder scaffold",
          controlMeasures: "Harness anchor",
        },
        {
          id: "2",
          kind: "FLHA",
          title: "Energized panel",
          hazardSummary: "Electrical arc flash live work",
        },
      ],
    });
    expect(report.sif.precursors.length).toBeGreaterThan(0);
    expect(report.interventions.length).toBeGreaterThan(0);
  });

  it("classifies energy wheel hazards", () => {
    const vase = new VeraAutonomousSafetyEngine();
    const report = vase.analyze({
      forms: [
        {
          id: "1",
          kind: "ENERGY_WHEEL",
          title: "Weld",
          hazardSummary: "Thermal heat fire chemical fume",
          controlMeasures: "Fire watch",
        },
      ],
    });
    expect(report.energyWheel.classifications.length).toBeGreaterThan(0);
  });

  it("builds twin safety overlay", () => {
    const vase = new VeraAutonomousSafetyEngine();
    const report = vase.analyze({
      workerId: "42",
      projectId: "7",
      forms: [{ id: "1", kind: "JHA", title: "Test", hazardSummary: "fall height" }],
    });
    expect(report.twinOverlay.worker?.sifRisk).toBeDefined();
    expect(report.twinOverlay.project?.hazardClusters).toBeDefined();
  });
});

import { describe, expect, it } from "vitest";
import { TranslationService } from "../../translation/service";

describe("TranslationService (legacy)", () => {
  const tx = new TranslationService();

  it("maps structured hazards via facade", () => {
    const hazards = tx.flhaToHazards({
      hazards: [
        {
          description: "Open excavation without barricades",
          energyType: "gravitational",
          controls: ["Hard barricades"],
          residualRisk: "high",
        },
      ],
    });
    expect(hazards).toHaveLength(1);
    expect(hazards[0]?.energyType).toBe("gravitational");
  });

  it("image local describe does not mark raw image used", () => {
    const local = tx.imageToLocalDescription({
      caption: "Worker near trench",
      objectKey: "tenant/12/img.jpg",
    });
    expect(local.usedRawImage).toBe(false);
    expect(local.features.some((f) => f.startsWith("ref:"))).toBe(true);
  });
});

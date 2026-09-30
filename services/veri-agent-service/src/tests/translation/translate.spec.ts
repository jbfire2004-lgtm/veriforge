import { describe, expect, it } from "vitest";
import {
  translateFlhaToPrompt,
  translateImageToPrompt,
  translateProjectToPrompt,
  translateSafetyBriefingToPrompt,
  TranslationService,
} from "../../translation";
import type { TranslationContext } from "../../translation";

const ctx = (
  level: "strict" | "relaxed" = "strict",
): TranslationContext => ({
  tenant: { companyId: 42, projectId: 7 },
  actorRoles: ["CONTRACTOR"],
  abstractionLevel: level,
  purpose: "flha_analyze",
});

describe("translateFlhaToPrompt", () => {
  it("preserves hazard categories and risk levels without leaking identifiers", () => {
    const prompt = translateFlhaToPrompt(
      {
        title: "Bay 3 FLHA — Acme Construction Inc",
        companyLegalName: "Acme Construction Inc",
        siteAddress: "123 Main Street",
        workers: [{ name: "John Smith", role: "operator" }],
        locations: ["51.0447, -114.0719"],
        tasks: ["Excavate trench near Panel B", "Install scaffolding"],
        hazards: [
          {
            description:
              "Worker John Smith near open excavation at 123 Main Street. Call jane.doe@acme.com. Acme Construction Inc.",
            energyType: "gravitational",
            controls: ["Hard barricades", "Hard hat PPE", "Spotter procedure"],
            residualRisk: "high",
            workerNames: ["John Smith"],
            location: "123 Main Street",
            companyName: "Acme Construction Inc",
          },
          {
            description: "Exposed electrical conductors during LOTO",
            energyType: "electrical",
            controls: ["LOTO isolation"],
            residualRisk: "critical",
          },
        ],
      },
      ctx("relaxed"),
    );

    expect(prompt.hazards).toHaveLength(2);
    expect(prompt.hazards[0]?.category).toBe("fall");
    expect(prompt.hazards[0]?.riskLevel).toBe("high");
    expect(prompt.hazards[0]?.energyType).toBe("gravitational");
    expect(prompt.hazards[0]?.mitigationTypes).toEqual(
      expect.arrayContaining(["engineering", "ppe", "administrative"]),
    );
    expect(prompt.hazards[1]?.category).toBe("electrical");
    expect(prompt.hazards[1]?.riskLevel).toBe("critical");

    const blob = `${prompt.userPrompt}\n${prompt.hazards.map((h) => h.summary).join("\n")}`;
    expect(blob).not.toMatch(/John Smith/);
    expect(blob).not.toContain("jane.doe@acme.com");
    expect(blob).not.toContain("123 Main Street");
    expect(blob).not.toMatch(/Acme Construction Inc/);
    expect(prompt.taskTypes).toEqual(
      expect.arrayContaining(["excavation", "scaffolding"]),
    );
    expect(prompt.redactionCount).toBeGreaterThan(0);
  });

  it("strict mode uses category-only summaries", () => {
    const prompt = translateFlhaToPrompt(
      {
        hazards: [
          {
            description: "Open excavation without barricades near west gate",
            residualRisk: "high",
          },
        ],
      },
      ctx("strict"),
    );
    expect(prompt.abstractionLevel).toBe("strict");
    expect(prompt.hazards[0]?.summary).toMatch(/fall hazard/i);
    expect(prompt.hazards[0]?.summary).toContain("high");
    expect(prompt.hazards[0]?.summary).not.toContain("west gate");
  });
});

describe("translateImageToPrompt", () => {
  it("builds textual hazard description without identifiers or raw bytes", () => {
    const prompt = translateImageToPrompt(
      {
        caption: "Worker John Smith at 123 Main Street near scaffold",
        objectKey: "tenant/42/photos/site-a.jpg",
        imageBase64: "AAAA",
        mimeType: "image/jpeg",
        vision: {
          sceneDescription:
            "Scaffold bay missing midrail; Worker Jane Doe visible. Site: North Yard.",
          equipment: ["scaffold", "harness"],
          conditions: ["daylight", "dry"],
          hazardsSuspected: ["fall from height"],
          labels: ["scaffold", "missing_guardrail"],
        },
      },
      ctx("relaxed"),
    );

    expect(prompt.includesRawImage).toBe(false);
    expect(prompt.userPrompt).not.toContain("AAAA");
    expect(prompt.sceneDescription).not.toMatch(/Jane Doe/);
    expect(prompt.sceneDescription).not.toContain("123 Main Street");
    expect(prompt.hazards).toContain("fall from height");
    expect(prompt.equipment).toEqual(
      expect.arrayContaining(["scaffold", "harness"]),
    );
    expect(prompt.features.some((f) => f.startsWith("ref:"))).toBe(true);
  });
});

describe("translateProjectToPrompt", () => {
  it("emits minimal context and drops names/addresses", () => {
    const prompt = translateProjectToPrompt(
      {
        id: 99,
        name: "Acme Tower Phase 2",
        companyLegalName: "Acme Construction Inc",
        siteAddress: "123 Main Street",
        clientName: "Big Client LLC",
        workType: "commercial fit-out",
        environment: "indoor",
        conditions: ["active_renovation", "limited_egress"],
        trade: "electrical",
        notes: "Contact jane@acme.com at site",
      },
      ctx("strict"),
    );

    expect(prompt.context.environment).toBe("indoor");
    expect(prompt.context.workType).toBe("commercial");
    expect(prompt.context.trade).toBe("electrical");
    expect(prompt.context.conditions).toEqual(
      expect.arrayContaining(["active_renovation", "limited_egress"]),
    );
    const blob = prompt.userPrompt;
    expect(blob).not.toContain("Acme Tower");
    expect(blob).not.toContain("123 Main Street");
    expect(blob).not.toContain("Big Client");
    expect(blob).not.toContain("jane@acme.com");
  });
});

describe("translateSafetyBriefingToPrompt", () => {
  it("composes briefing from FLHA + project without leaking PII", () => {
    const briefing = translateSafetyBriefingToPrompt(
      {
        flha: {
          hazards: [
            {
              description: "Fall hazard on scaffold — Worker Bob Jones",
              controls: ["Harness PPE"],
              residualRisk: "high",
            },
          ],
          tasks: ["Scaffold erect"],
        },
        project: {
          name: "Secret Project",
          workType: "industrial",
          environment: "outdoor",
          conditions: ["windy"],
        },
      },
      ctx("strict"),
    );

    expect(briefing.flha.hazards[0]?.riskLevel).toBe("high");
    expect(briefing.flha.hazards[0]?.category).toBe("fall");
    expect(briefing.project?.context.environment).toBe("outdoor");
    expect(briefing.userPrompt).not.toMatch(/Bob Jones/);
    expect(briefing.userPrompt).not.toContain("Secret Project");
  });
});

describe("TranslationService facade", () => {
  const tx = new TranslationService();

  it("legacy flhaToHazards preserves energy and risk", () => {
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
    expect(hazards[0]?.energyType).toBe("gravitational");
    expect(hazards[0]?.residualRisk).toBe("high");
  });

  it("owner_safe strips actionable detail", () => {
    const hazards = tx.toOwnerSafe([
      {
        id: "hz-1",
        energyType: "electrical",
        hazardSummary: "Exposed 480V conductors at panel B",
        controls: ["LOTO"],
        residualRisk: "critical",
      },
    ]);
    expect(hazards[0]?.hazardSummary).toContain("Residual risk band");
    expect(hazards[0]?.hazardSummary).not.toContain("480V");
  });
});

import type { EnergyType, EnergyWheelAnalysis, SafetyContextInput } from "../types";
import { extractHazards } from "../utils/scoring";

const ENERGY_MAP: { energy: EnergyType; tags: string[] }[] = [
  { energy: "gravity", tags: ["fall", "drop", "height"] },
  { energy: "motion", tags: ["struck_by", "vehicle", "mobile"] },
  { energy: "mechanical", tags: ["caught_in", "pinch", "rotating"] },
  { energy: "electrical", tags: ["electrical", "arc", "energized"] },
  { energy: "chemical", tags: ["chemical", "toxic", "spill"] },
  { energy: "pressure", tags: ["pressure", "hydraulic"] },
  { energy: "thermal", tags: ["thermal", "heat", "fire", "weld"] },
  { energy: "radiation", tags: ["radiation", "laser"] },
  { energy: "biological", tags: ["biological", "blood"] },
];

const CONTROL_BY_ENERGY: Record<EnergyType, string[]> = {
  gravity: ["Fall protection", "Barricades", "Dropped object prevention"],
  motion: ["Spotter", "Exclusion zone", "Traffic management"],
  mechanical: ["Guarding", "Lockout", "Pinch point awareness"],
  electrical: ["LOTO", "Insulated tools", "Arc flash PPE"],
  chemical: ["SDS", "Respiratory protection", "Spill kit"],
  pressure: ["Bleed lines", "Pressure relief", "Hose inspection"],
  thermal: ["Hot work permit", "Fire watch", "Burn protection"],
  radiation: ["Shielding", "Dosimetry", "Laser controls"],
  biological: ["Bloodborne pathogen kit", "Hygiene", "Vaccination"],
};

export class EnergyWheelEngine {
  analyze(ctx: SafetyContextInput): EnergyWheelAnalysis {
    const text = (ctx.forms ?? [])
      .map((f) => `${f.hazardSummary ?? ""} ${f.controlMeasures ?? ""}`)
      .join(" ");
    const hazardTags = extractHazards(text);
    const visionTags = ctx.visionHazards ?? [];

    const classifications = ENERGY_MAP.map((row) => {
      const hazards = [...row.tags.filter((t) => hazardTags.includes(t) || text.toLowerCase().includes(t))];
      if (row.energy === "mechanical" && visionTags.includes("missing_guard")) {
        hazards.push("missing_guard");
      }
      return {
        energy: row.energy,
        hazards,
        confidence: hazards.length ? 0.8 : 0.2,
      };
    }).filter((c) => c.hazards.length > 0);

    const activeEnergies = classifications.map((c) => c.energy);
    const recommendedControls = activeEnergies.flatMap((e) => CONTROL_BY_ENERGY[e] ?? []);
    const statedControls = (ctx.forms ?? [])
      .map((f) => f.controlMeasures?.toLowerCase() ?? "")
      .join(" ");

    const missingControls: string[] = [];
    for (const e of activeEnergies) {
      for (const ctrl of CONTROL_BY_ENERGY[e] ?? []) {
        if (!statedControls.includes(ctrl.split(" ")[0]!.toLowerCase())) {
          missingControls.push(`${e}: ${ctrl}`);
        }
      }
    }

    const conflicts: string[] = [];
    if (activeEnergies.includes("electrical") && activeEnergies.includes("pressure")) {
      conflicts.push("Electrical + pressure interaction — verify isolation order");
    }
    if (activeEnergies.includes("thermal") && /flammable/i.test(text)) {
      conflicts.push("Thermal energy near flammable materials");
    }

    return {
      classifications,
      missingControls: [...new Set(missingControls)].slice(0, 8),
      incorrectControls: [],
      recommendedControls: [...new Set(recommendedControls)].slice(0, 10),
      conflicts,
      summary: `Energy Wheel: ${activeEnergies.length} energy types active, ${missingControls.length} missing controls.`,
    };
  }
}

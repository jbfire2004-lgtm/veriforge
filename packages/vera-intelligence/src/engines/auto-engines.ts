import type { ClassificationResult, SummaryResult, TrainingIntelInput } from "../types";

const CSA_PATTERNS = [/CSA\s*Z462/i, /CSA\s*W117/i, /CSA\s*B335/i, /electrical/i];
const OHS_PATTERNS = [/OHS/i, /occupational/i, /WHMIS/i, /fall protection/i];

export class AutoClassificationEngine {
  classifyTraining(input: TrainingIntelInput): ClassificationResult {
    const text = `${input.title} ${(input.standardCodes ?? []).join(" ")}`;
    const tags: string[] = [];
    const standards: string[] = [];
    if (CSA_PATTERNS.some((p) => p.test(text))) {
      tags.push("csa");
      standards.push("CSA");
    }
    if (OHS_PATTERNS.some((p) => p.test(text))) {
      tags.push("ohs");
      standards.push("OHS");
    }
    if (input.isValid) tags.push("valid");
    else tags.push("invalid");
    return {
      category: tags.includes("csa") ? "safety_standard" : "general_training",
      tags,
      confidence: tags.length > 0 ? 0.85 : 0.5,
      standards,
    };
  }

  classifyInspectionPhoto(_hints?: { hazards?: string[] }): ClassificationResult {
    const hazards = _hints?.hazards ?? [];
    return {
      category: hazards.length ? "hazard_detected" : "routine",
      tags: hazards.length ? ["hazard", ...hazards] : ["clear"],
      confidence: hazards.length ? 0.7 : 0.6,
    };
  }
}

export class AutoTaggingEngine {
  tag(entityType: string, signals: Record<string, boolean>): string[] {
    const tags: string[] = [entityType];
    for (const [k, v] of Object.entries(signals)) {
      if (v) tags.push(k);
    }
    return tags;
  }
}

export class AutoSummarizationEngine {
  summarize(title: string, bullets: string[]): SummaryResult {
    const top = bullets.slice(0, 5);
    const text = `${title}: ${top.join("; ")}${bullets.length > 5 ? "…" : ""}`;
    return { text, bullets: top, generatedAt: new Date().toISOString() };
  }
}

export class AutoCorrectionEngine {
  suggestCorrections(issues: string[]): string[] {
    return issues.map((i) => {
      if (i.includes("expir")) return "Renew or upload updated certificate";
      if (i.includes("mismatch")) return "Re-map training to correct standard";
      if (i.includes("inspection")) return "Complete inspection before assignment";
      return `Resolve: ${i}`;
    });
  }
}

export class AutoMappingEngine {
  mapTrainingToStandards(input: TrainingIntelInput): { csa: string[]; ohs: string[] } {
    const cls = new AutoClassificationEngine().classifyTraining(input);
    return {
      csa: cls.standards?.includes("CSA") ? ["Z462", "W117"] : [],
      ohs: cls.standards?.includes("OHS") ? ["WHMIS", "FallProtection"] : [],
    };
  }
}

export class AutoPrioritizationEngine {
  prioritize<T extends { priority: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => b.priority - a.priority);
  }
}

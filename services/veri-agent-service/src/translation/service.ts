import type { HazardAbstraction } from "../core/types";
import { translateFlhaToPrompt } from "./translate-flha";
import { translateImageToPrompt } from "./translate-image";
import { translateProjectToPrompt } from "./translate-project";
import { translateSafetyBriefingToPrompt } from "./safety-briefing";
import type {
  AbstractionLevel,
  FlhaDocument,
  FlhaPrompt,
  ImageMeta,
  ImagePrompt,
  Project,
  ProjectPrompt,
  SafetyBriefingPrompt,
  TranslationContext,
} from "./types";

/** @deprecated Prefer FlhaDocument */
export type FlhaDocumentInput = {
  title?: string;
  tasks?: string[];
  hazards?: Array<{
    description: string;
    energyType?: string;
    controls?: string[];
    residualRisk?: HazardAbstraction["residualRisk"];
  }>;
  narrative?: string;
};

/** @deprecated Prefer ImageMeta */
export type ImageDescribeInput = {
  caption?: string;
  objectKey?: string;
  imageBase64?: string;
  mimeType?: string;
};

/**
 * Facade for domain → AI-safe prompt translation.
 * Policy decides allow/deny; translation only abstracts; firewall enforces egress.
 */
export class TranslationService {
  translateFlhaToPrompt(
    flha: FlhaDocument,
    context: TranslationContext,
  ): FlhaPrompt {
    return translateFlhaToPrompt(flha, context);
  }

  translateImageToPrompt(
    imageMeta: ImageMeta,
    context: TranslationContext,
  ): ImagePrompt {
    return translateImageToPrompt(imageMeta, context);
  }

  translateProjectToPrompt(
    project: Project,
    context: TranslationContext,
  ): ProjectPrompt {
    return translateProjectToPrompt(project, context);
  }

  translateSafetyBriefingToPrompt(
    input: { flha: FlhaDocument; project?: Project; image?: ImageMeta },
    context: TranslationContext,
  ): SafetyBriefingPrompt {
    return translateSafetyBriefingToPrompt(input, context);
  }

  /**
   * Legacy helper used by pipeline — maps FlhaPrompt hazards to HazardAbstraction.
   */
  flhaToHazards(
    doc: FlhaDocumentInput,
    opts?: { abstractionLevel?: AbstractionLevel; companyId?: number },
  ): HazardAbstraction[] {
    const prompt = translateFlhaToPrompt(doc, {
      tenant: { companyId: opts?.companyId ?? 1 },
      abstractionLevel: opts?.abstractionLevel ?? "relaxed",
    });
    return prompt.hazards.map((h, i) => ({
      id: `hz-${i + 1}`,
      energyType: h.energyType,
      hazardSummary: h.summary,
      controls: h.mitigationTypes,
      residualRisk: h.riskLevel,
    }));
  }

  /**
   * Legacy helper — image → local description without raw bytes.
   */
  imageToLocalDescription(input: ImageDescribeInput): {
    description: string;
    features: string[];
    usedRawImage: boolean;
  } {
    const prompt = translateImageToPrompt(input, {
      tenant: { companyId: 1 },
      abstractionLevel: "relaxed",
    });
    return {
      description: prompt.sceneDescription,
      features: prompt.features,
      usedRawImage: false,
    };
  }

  /** Owner-safe view: residual risk bands only. */
  toOwnerSafe(hazards: HazardAbstraction[]): HazardAbstraction[] {
    return hazards.map((h) => ({
      id: h.id,
      energyType: h.energyType,
      hazardSummary: `Residual risk band: ${h.residualRisk} (${h.energyType})`,
      controls: h.controls.length ? ["Controls recorded"] : [],
      residualRisk: h.residualRisk,
    }));
  }
}

export {
  translateFlhaToPrompt,
  translateImageToPrompt,
  translateProjectToPrompt,
  translateSafetyBriefingToPrompt,
};

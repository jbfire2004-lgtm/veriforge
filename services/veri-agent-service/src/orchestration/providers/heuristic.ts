import type { AiProvider } from "../provider";
import type {
  AiTaskType,
  ProviderRequest,
  ProviderResponse,
} from "../types";

/**
 * Rule-based fallback — no external egress.
 */
export class HeuristicProvider implements AiProvider {
  readonly id = "heuristic";
  readonly kind = "heuristic" as const;
  readonly regions = ["*"] as const;

  supports(_taskType: AiTaskType): boolean {
    return true;
  }

  async complete(req: ProviderRequest): Promise<ProviderResponse> {
    const purpose = req.system.toLowerCase();
    const isFlha =
      /flha|hazard|safety analyst/.test(purpose) ||
      /hazard|residualRisk|mitigation/i.test(req.userText);
    const isVision =
      /visual|image|scene/.test(purpose) ||
      /sceneDescription|hazardsSuspected/i.test(req.userText);

    let data: Record<string, unknown>;
    if (isFlha) {
      data = {
        analysis: "heuristic",
        recommendations: [
          "Verify controls match residual risk bands",
          "Confirm competent person sign-off before work",
        ],
        riskHighlights: [],
        controlsGaps: [],
        hazardsReviewed: true,
      };
    } else if (isVision) {
      data = {
        description: req.userText.slice(0, 400),
        labels: ["site_condition", "requires_human_review"],
        hazardsSuspected: [],
        analysis: "heuristic_local",
      };
    } else {
      data = {
        analysis: "heuristic",
        summary: req.userText.slice(0, 240),
        labels: ["generic"],
      };
    }

    return {
      rawText: JSON.stringify(data),
      model: "heuristic",
    };
  }
}

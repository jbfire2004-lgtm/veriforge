import { saasGateway } from "../_gateway";
import type { SafetyScorecard } from "../../../types/scorecards";

export const scorecardService = {
  get(orgId: string, accessToken: string) {
    return saasGateway.request<SafetyScorecard>(`/scorecard/${orgId}`, { accessToken });
  },
  recalculate(orgId: string, accessToken: string) {
    return saasGateway.request<SafetyScorecard>("/scorecard/recalculate", {
      method: "POST",
      body: JSON.stringify({ orgId }),
      accessToken,
    });
  },
};

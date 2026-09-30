import { saasGateway } from "../_gateway";
import type { DeveloperActionLog, FeatureFlag } from "../../../types/developer";

export const developerService = {
  dashboard(accessToken: string) {
    return saasGateway.request("/developer/dashboard", { accessToken });
  },
  listFlags(accessToken: string) {
    return saasGateway.request<{ flags: FeatureFlag[] }>("/developer/feature-flags", {
      accessToken,
    });
  },
  listLogs(accessToken: string) {
    return saasGateway.request<{ items: DeveloperActionLog[] }>("/developer/logs", {
      accessToken,
    });
  },
};

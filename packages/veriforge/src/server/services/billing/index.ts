import { saasGateway } from "../_gateway";
import type { BillingUpdateInput, BillingView } from "../../../types/billing";

export const billingService = {
  get(accessToken: string) {
    return saasGateway.request<BillingView>("/billing", { accessToken });
  },
  update(input: BillingUpdateInput, accessToken: string) {
    return saasGateway.request<BillingView>("/billing/update", {
      method: "POST",
      body: JSON.stringify(input),
      accessToken,
    });
  },
};

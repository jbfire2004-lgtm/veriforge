import { saasGateway } from "../_gateway";
import type { ContractAward, ContractorSummary } from "../../../types/client";

export const clientService = {
  listContractors(accessToken: string) {
    return saasGateway.request<{ items: ContractorSummary[] }>("/client/review/contractors", {
      accessToken,
    });
  },
  award(input: { contractorOrgId: string; projectName?: string }, accessToken: string) {
    return saasGateway.request<{ award: ContractAward }>("/client/review/award", {
      method: "POST",
      body: JSON.stringify(input),
      accessToken,
    });
  },
};

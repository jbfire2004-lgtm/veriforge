import { saasGateway } from "../_gateway";
import type {
  ComplianceReviewInput,
  ComplianceUploadInput,
} from "../../../types/compliance";

export const complianceService = {
  upload(input: ComplianceUploadInput, accessToken: string) {
    return saasGateway.request("/compliance/upload", {
      method: "POST",
      body: JSON.stringify(input),
      accessToken,
    });
  },
  listForOrg(orgId: string, accessToken: string) {
    return saasGateway.request(`/compliance/${orgId}`, { accessToken });
  },
  review(input: ComplianceReviewInput, accessToken: string) {
    return saasGateway.request(`/compliance/${input.artifactId}/review`, {
      method: "POST",
      body: JSON.stringify({ decision: input.decision, notes: input.notes }),
      accessToken,
    });
  },
};

import { saasGateway } from "../_gateway";
import type { CreateOrganizationInput, Organization } from "../../../types/org";

export const orgService = {
  create(input: CreateOrganizationInput, accessToken?: string) {
    return saasGateway.request<{ organization: Organization }>("/org/create", {
      method: "POST",
      body: JSON.stringify(input),
      accessToken,
    });
  },
  get(orgId: string, accessToken: string) {
    return saasGateway.request(`/org/${orgId}`, { accessToken });
  },
  listUsers(orgId: string, accessToken: string) {
    return saasGateway.request(`/org/${orgId}/users`, { accessToken });
  },
  listRoles(orgId: string, accessToken: string) {
    return saasGateway.request(`/org/${orgId}/roles`, { accessToken });
  },
};

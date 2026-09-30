import { saasGateway } from "../_gateway";
import type { ModuleUpdateInput } from "../../../types/modules";

export const modulesService = {
  list(accessToken: string) {
    return saasGateway.request("/modules", { accessToken });
  },
  update(modules: ModuleUpdateInput[], accessToken: string) {
    return saasGateway.request("/modules/update", {
      method: "POST",
      body: JSON.stringify({ modules }),
      accessToken,
    });
  },
};

import { procedure } from "../trpc";
import { clientService } from "../../services/client";
import type { TrpcContext } from "../trpc";

export const clientRouter = {
  contractors: procedure((_input: void, ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Hiring-client token required");
    return clientService.listContractors(ctx.accessToken);
  }),
  award: procedure(
    (input: { contractorOrgId: string; projectName?: string }, ctx: TrpcContext) => {
      if (!ctx.accessToken) throw new Error("Hiring-client token required");
      return clientService.award(input, ctx.accessToken);
    },
  ),
};

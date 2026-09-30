import { procedure } from "../trpc";
import { billingService } from "../../services/billing";
import type { TrpcContext } from "../trpc";
import type { BillingUpdateInput } from "../../../types/billing";

export const billingRouter = {
  get: procedure((_i: void, ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Org token required");
    return billingService.get(ctx.accessToken);
  }),
  update: procedure((input: BillingUpdateInput, ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Org token required");
    return billingService.update(input, ctx.accessToken);
  }),
};

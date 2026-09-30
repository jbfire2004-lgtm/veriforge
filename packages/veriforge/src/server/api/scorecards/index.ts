import { procedure } from "../trpc";
import { scorecardService } from "../../services/scorecards";
import type { TrpcContext } from "../trpc";

export const scorecardsRouter = {
  getByOrg: procedure((orgId: string, ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Token required");
    return scorecardService.get(orgId, ctx.accessToken);
  }),
  recalculate: procedure((orgId: string, ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Org token required");
    return scorecardService.recalculate(orgId, ctx.accessToken);
  }),
};

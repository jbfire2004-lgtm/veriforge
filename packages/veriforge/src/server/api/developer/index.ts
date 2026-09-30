import { procedure } from "../trpc";
import { developerService } from "../../services/developer";
import type { TrpcContext } from "../trpc";

export const developerRouter = {
  dashboard: procedure((_i: void, ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Developer token required");
    return developerService.dashboard(ctx.accessToken);
  }),
  flags: procedure((_i: void, ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Developer token required");
    return developerService.listFlags(ctx.accessToken);
  }),
  logs: procedure((_i: void, ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Developer token required");
    return developerService.listLogs(ctx.accessToken);
  }),
};

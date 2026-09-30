import { procedure } from "../trpc";
import { modulesService } from "../../services/modules";
import type { TrpcContext } from "../trpc";
import type { ModuleUpdateInput } from "../../../types/modules";

export const modulesRouter = {
  list: procedure((_i: void, ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Org token required");
    return modulesService.list(ctx.accessToken);
  }),
  update: procedure((modules: ModuleUpdateInput[], ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Org token required");
    return modulesService.update(modules, ctx.accessToken);
  }),
};

import { procedure } from "../trpc";
import { orgService } from "../../services/org";
import type { TrpcContext } from "../trpc";
import type { CreateOrganizationInput } from "../../../types/org";

function requireToken(ctx: TrpcContext): string {
  if (!ctx.accessToken) throw new Error("Organization access token required");
  return ctx.accessToken;
}

export const orgRouter = {
  create: procedure((input: CreateOrganizationInput) => orgService.create(input)),
  get: procedure((orgId: string, ctx: TrpcContext) =>
    orgService.get(orgId, requireToken(ctx)),
  ),
  users: procedure((orgId: string, ctx: TrpcContext) =>
    orgService.listUsers(orgId, requireToken(ctx)),
  ),
  roles: procedure((orgId: string, ctx: TrpcContext) =>
    orgService.listRoles(orgId, requireToken(ctx)),
  ),
};

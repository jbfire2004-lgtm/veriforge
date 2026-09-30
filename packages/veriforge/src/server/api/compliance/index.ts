import { procedure } from "../trpc";
import { complianceService } from "../../services/compliance";
import type { TrpcContext } from "../trpc";
import type {
  ComplianceReviewInput,
  ComplianceUploadInput,
} from "../../../types/compliance";

export const complianceRouter = {
  upload: procedure((input: ComplianceUploadInput, ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Org token required");
    return complianceService.upload(input, ctx.accessToken);
  }),
  getByOrg: procedure((orgId: string, ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Token required");
    return complianceService.listForOrg(orgId, ctx.accessToken);
  }),
  review: procedure((input: ComplianceReviewInput, ctx: TrpcContext) => {
    if (!ctx.accessToken) throw new Error("Hiring-client token required");
    return complianceService.review(input, ctx.accessToken);
  }),
};

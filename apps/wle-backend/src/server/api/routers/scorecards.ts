import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { bearer, placeholderResult, saasFetch } from './_saas';
import { authorizationField } from './_schemas';

type ContractorScorecardPayload = {
  globalScorecard?: Record<string, unknown>;
  projectScorecards?: Array<Record<string, unknown> & { projectId?: string }>;
};

export const scorecardsRouter = createTRPCRouter({
  /** GET /api/scorecards.getScorecard */
  getScorecard: publicProcedure
    .input(z.object({ authorization: authorizationField, orgId: z.string().uuid() }))
    .query(({ input }) =>
      saasFetch(`/scorecard/${input.orgId}`, {
        authorization: bearer(input.authorization),
      }),
    ),

  /** POST /api/scorecards.recalculateScorecard */
  recalculateScorecard: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        orgId: z.string().uuid().optional(),
      }),
    )
    .mutation(({ input }) =>
      saasFetch('/scorecard/recalculate', {
        method: 'POST',
        authorization: bearer(input.authorization),
        body: JSON.stringify({ orgId: input.orgId }),
      }),
    ),

  /** GET /api/scorecards.getProjectScorecard */
  getProjectScorecard: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        orgId: z.string().uuid(),
        projectId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const data = await saasFetch<ContractorScorecardPayload>(
        `/client/contractor/${input.orgId}/scorecard`,
        { authorization: bearer(input.authorization) },
      );
      const project = data.projectScorecards?.find(
        (row) => row.projectId === input.projectId,
      );
      return (
        project ??
        placeholderResult('scorecards', 'getProjectScorecard', {
          orgId: input.orgId,
          projectId: input.projectId,
        })
      );
    }),

  /** GET /api/scorecards.getGlobalScorecard */
  getGlobalScorecard: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        orgId: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      const data = await saasFetch<ContractorScorecardPayload>(
        `/client/contractor/${input.orgId}/scorecard`,
        { authorization: bearer(input.authorization) },
      );
      return (
        data.globalScorecard ??
        placeholderResult('scorecards', 'getGlobalScorecard', { orgId: input.orgId })
      );
    }),

  // --- backward-compatible aliases ---
  getByOrg: publicProcedure
    .input(z.object({ authorization: authorizationField, orgId: z.string().uuid() }))
    .query(({ input }) =>
      saasFetch(`/scorecard/${input.orgId}`, {
        authorization: bearer(input.authorization),
      }),
    ),
  recalculate: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        orgId: z.string().uuid().optional(),
      }),
    )
    .mutation(({ input }) =>
      saasFetch('/scorecard/recalculate', {
        method: 'POST',
        authorization: bearer(input.authorization),
        body: JSON.stringify({ orgId: input.orgId }),
      }),
    ),
});

/** @deprecated Use `scorecardsRouter` */
export const scorecardRouter = scorecardsRouter;

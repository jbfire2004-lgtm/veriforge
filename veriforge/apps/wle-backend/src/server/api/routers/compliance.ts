import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { bearer, saasFetch } from './_saas';
import { artifactType, authorizationField } from './_schemas';

export const complianceRouter = createTRPCRouter({
  /** POST /api/compliance.uploadArtifact */
  uploadArtifact: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        type: artifactType,
        fileUrl: z.string().min(4),
        expiryDate: z.string().optional().nullable(),
        label: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, ...body } = input;
      return saasFetch('/compliance/upload', {
        method: 'POST',
        authorization: bearer(authorization),
        body: JSON.stringify(body),
      });
    }),

  /** POST /api/compliance.reviewArtifact */
  reviewArtifact: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        artifactId: z.string().uuid(),
        decision: z.enum(['approve', 'reject']),
        notes: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, artifactId, ...body } = input;
      return saasFetch(`/compliance/${artifactId}/review`, {
        method: 'POST',
        authorization: bearer(authorization),
        body: JSON.stringify(body),
      });
    }),

  /** POST /api/compliance.updateArtifact */
  updateArtifact: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        artifactId: z.string().uuid(),
        type: artifactType.optional(),
        fileUrl: z.string().optional(),
        expiryDate: z.string().optional().nullable(),
        label: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, artifactId, ...body } = input;
      return saasFetch(`/compliance/${artifactId}/update`, {
        method: 'POST',
        authorization: bearer(authorization),
        body: JSON.stringify(body),
      });
    }),

  /** GET /api/compliance.getComplianceStatus */
  getComplianceStatus: publicProcedure
    .input(z.object({ authorization: authorizationField, orgId: z.string().uuid() }))
    .query(async ({ input }) => {
      const detail = await saasFetch<{
        scorecard?: unknown;
        reminders?: unknown[];
        artifacts?: unknown[];
      }>(`/compliance/${input.orgId}`, {
        authorization: bearer(input.authorization),
      });
      return {
        orgId: input.orgId,
        scorecard: detail.scorecard ?? null,
        reminders: detail.reminders ?? [],
        artifactCount: Array.isArray(detail.artifacts) ? detail.artifacts.length : 0,
      };
    }),

  /** GET /api/compliance.getArtifacts */
  getArtifacts: publicProcedure
    .input(z.object({ authorization: authorizationField, orgId: z.string().uuid() }))
    .query(({ input }) =>
      saasFetch(`/compliance/${input.orgId}`, {
        authorization: bearer(input.authorization),
      }),
    ),

  // --- backward-compatible aliases ---
  upload: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        type: artifactType,
        fileUrl: z.string().min(4),
        expiryDate: z.string().optional().nullable(),
        label: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, ...body } = input;
      return saasFetch('/compliance/upload', {
        method: 'POST',
        authorization: bearer(authorization),
        body: JSON.stringify(body),
      });
    }),
  review: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        id: z.string().uuid(),
        decision: z.enum(['approve', 'reject']),
        notes: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, id, ...body } = input;
      return saasFetch(`/compliance/${id}/review`, {
        method: 'POST',
        authorization: bearer(authorization),
        body: JSON.stringify(body),
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        id: z.string().uuid(),
        type: artifactType.optional(),
        fileUrl: z.string().optional(),
        expiryDate: z.string().optional().nullable(),
        label: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, id, ...body } = input;
      return saasFetch(`/compliance/${id}/update`, {
        method: 'POST',
        authorization: bearer(authorization),
        body: JSON.stringify(body),
      });
    }),
  getByOrg: publicProcedure
    .input(z.object({ authorization: authorizationField, orgId: z.string().uuid() }))
    .query(({ input }) =>
      saasFetch(`/compliance/${input.orgId}`, {
        authorization: bearer(input.authorization),
      }),
    ),
});

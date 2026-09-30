import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { bearer, saasFetch } from './_saas';
import { authorizationField } from './_schemas';

export const clientRouter = createTRPCRouter({
  /** GET /api/client.getContractors */
  getContractors: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        skip: z.number().int().min(0).optional(),
        take: z.number().int().min(1).max(100).optional(),
      }),
    )
    .query(({ input }) => {
      const params = new URLSearchParams();
      if (input.skip != null) params.set('skip', String(input.skip));
      if (input.take != null) params.set('take', String(input.take));
      const qs = params.toString();
      return saasFetch(`/client/contractors${qs ? `?${qs}` : ''}`, {
        authorization: bearer(input.authorization, 'Hiring-client bearer'),
      });
    }),

  /** GET /api/client.getContractorScorecard */
  getContractorScorecard: publicProcedure
    .input(z.object({ authorization: authorizationField, contractorId: z.string().uuid() }))
    .query(({ input }) =>
      saasFetch(`/client/contractor/${input.contractorId}/scorecard`, {
        authorization: bearer(input.authorization, 'Hiring-client bearer'),
      }),
    ),

  /** GET /api/client.getContractorCompliance */
  getContractorCompliance: publicProcedure
    .input(z.object({ authorization: authorizationField, contractorId: z.string().uuid() }))
    .query(({ input }) =>
      saasFetch(`/client/contractor/${input.contractorId}/compliance`, {
        authorization: bearer(input.authorization, 'Hiring-client bearer'),
      }),
    ),

  /** POST /api/client.awardContract */
  awardContract: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        contractorId: z.string().uuid(),
        projectName: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, contractorId, ...body } = input;
      return saasFetch(`/client/contractor/${contractorId}/award`, {
        method: 'POST',
        authorization: bearer(authorization, 'Hiring-client bearer'),
        body: JSON.stringify(body),
      });
    }),

  /** POST /api/client.reviewCompliance — hiring-client artifact review */
  reviewCompliance: publicProcedure
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
        authorization: bearer(authorization, 'Hiring-client bearer'),
        body: JSON.stringify(body),
      });
    }),

  // --- backward-compatible aliases ---
  signup: publicProcedure
    .input(
      z.object({
        companyName: z.string().min(2),
        contactName: z.string().min(1),
        contactEmail: z.string().email(),
        contactPhone: z.string().optional(),
        password: z.string().min(12),
        adminFullName: z.string().optional(),
      }),
    )
    .mutation(({ input }) =>
      saasFetch('/client/auth/signup', { method: 'POST', body: JSON.stringify(input) }),
    ),
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(({ input }) =>
      saasFetch('/client/auth/login', { method: 'POST', body: JSON.stringify(input) }),
    ),
  listContractors: publicProcedure
    .input(z.object({ authorization: authorizationField }))
    .query(({ input }) =>
      saasFetch('/client/contractors', {
        authorization: bearer(input.authorization, 'Hiring-client bearer'),
      }),
    ),
  getScorecard: publicProcedure
    .input(z.object({ authorization: authorizationField, id: z.string().uuid() }))
    .query(({ input }) =>
      saasFetch(`/client/contractor/${input.id}/scorecard`, {
        authorization: bearer(input.authorization, 'Hiring-client bearer'),
      }),
    ),
  getCompliance: publicProcedure
    .input(z.object({ authorization: authorizationField, id: z.string().uuid() }))
    .query(({ input }) =>
      saasFetch(`/client/contractor/${input.id}/compliance`, {
        authorization: bearer(input.authorization, 'Hiring-client bearer'),
      }),
    ),
  award: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        id: z.string().uuid(),
        projectName: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, id, ...body } = input;
      return saasFetch(`/client/contractor/${id}/award`, {
        method: 'POST',
        authorization: bearer(authorization, 'Hiring-client bearer'),
        body: JSON.stringify(body),
      });
    }),
});

/** @deprecated Use `clientRouter` */
export const hiringClientRouter = clientRouter;

import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { bearer, saasFetch } from './_saas';
import { authorizationField, developerRole } from './_schemas';

export const developerRouter = createTRPCRouter({
  /** GET /api/developer.getOrganizations */
  getOrganizations: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        q: z.string().optional(),
        skip: z.number().int().min(0).optional(),
        take: z.number().int().min(1).max(100).optional(),
      }),
    )
    .query(({ input }) => {
      const params = new URLSearchParams();
      if (input.q) params.set('q', input.q);
      if (input.skip != null) params.set('skip', String(input.skip));
      if (input.take != null) params.set('take', String(input.take));
      const qs = params.toString();
      return saasFetch(`/developer/orgs${qs ? `?${qs}` : ''}`, {
        authorization: bearer(input.authorization, 'Developer bearer'),
      });
    }),

  /** GET /api/developer.getLogs */
  getLogs: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        skip: z.number().int().min(0).optional(),
        take: z.number().int().min(1).max(200).optional(),
        action: z.string().optional(),
        developerId: z.string().uuid().optional(),
      }),
    )
    .query(({ input }) => {
      const params = new URLSearchParams();
      if (input.skip != null) params.set('skip', String(input.skip));
      if (input.take != null) params.set('take', String(input.take));
      if (input.action) params.set('action', input.action);
      if (input.developerId) params.set('developerId', input.developerId);
      const qs = params.toString();
      return saasFetch(`/developer/logs${qs ? `?${qs}` : ''}`, {
        authorization: bearer(input.authorization, 'Developer bearer'),
      });
    }),

  /** POST /api/developer.impersonateUser */
  impersonateUser: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        targetOrgId: z.string().uuid(),
        reason: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, ...body } = input;
      return saasFetch('/developer/impersonate', {
        method: 'POST',
        authorization: bearer(authorization, 'Developer bearer'),
        body: JSON.stringify(body),
      });
    }),

  /** POST /api/developer.createModule */
  createModule: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        code: z.string().min(2).max(32),
        name: z.string().min(2).max(120),
        description: z.string().max(500).optional(),
        sortOrder: z.number().int().min(0).max(999).optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, ...body } = input;
      return saasFetch('/developer/modules', {
        method: 'POST',
        authorization: bearer(authorization, 'Developer bearer'),
        body: JSON.stringify(body),
      });
    }),

  /** POST /api/developer.updateModule */
  updateModule: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        code: z.string().min(2).max(32),
        name: z.string().min(2).max(120).optional(),
        description: z.string().max(500).nullable().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().min(0).max(999).optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, code, ...body } = input;
      return saasFetch(`/developer/modules/${encodeURIComponent(code)}`, {
        method: 'PATCH',
        authorization: bearer(authorization, 'Developer bearer'),
        body: JSON.stringify(body),
      });
    }),

  /** POST /api/developer.toggleFeatureFlag */
  toggleFeatureFlag: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        key: z.string().min(2).max(64),
        enabled: z.boolean(),
        description: z.string().max(500).optional(),
        payload: z.record(z.string(), z.unknown()).nullable().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, ...body } = input;
      return saasFetch('/developer/feature-flags', {
        method: 'POST',
        authorization: bearer(authorization, 'Developer bearer'),
        body: JSON.stringify(body),
      });
    }),

  // --- backward-compatible aliases ---
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
    .mutation(({ input }) =>
      saasFetch('/developer/auth/login', { method: 'POST', body: JSON.stringify(input) }),
    ),
  bootstrap: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(12),
        role: developerRole,
        fullName: z.string().optional(),
        bootstrapSecret: z.string().optional(),
      }),
    )
    .mutation(({ input }) =>
      saasFetch('/developer/auth/bootstrap', { method: 'POST', body: JSON.stringify(input) }),
    ),
  dashboard: publicProcedure
    .input(z.object({ authorization: authorizationField }))
    .query(({ input }) =>
      saasFetch('/developer/dashboard', {
        authorization: bearer(input.authorization, 'Developer bearer'),
      }),
    ),
  listOrgs: publicProcedure
    .input(z.object({ authorization: authorizationField, q: z.string().optional() }))
    .query(({ input }) => {
      const q = input.q ? `?q=${encodeURIComponent(input.q)}` : '';
      return saasFetch(`/developer/orgs${q}`, {
        authorization: bearer(input.authorization, 'Developer bearer'),
      });
    }),
  impersonate: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        targetOrgId: z.string().uuid(),
        reason: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, ...body } = input;
      return saasFetch('/developer/impersonate', {
        method: 'POST',
        authorization: bearer(authorization, 'Developer bearer'),
        body: JSON.stringify(body),
      });
    }),
});

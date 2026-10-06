import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { bearer, saasFetch } from './_saas';
import {
  authorizationField,
  moduleToggleInput,
  orgCreateInput,
  orgRoleCode,
} from './_schemas';

export const orgRouter = createTRPCRouter({
  /** POST /api/org.createOrganization */
  createOrganization: publicProcedure.input(orgCreateInput).mutation(({ input }) =>
    saasFetch('/org/create', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  ),

  /** POST /api/org.createUser */
  createUser: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        email: z.string().email(),
        fullName: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        password: z.string().optional(),
        role: orgRoleCode.exclude(['owner']).optional(),
        orgRoleName: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, ...body } = input;
      return saasFetch('/org/user/create', {
        method: 'POST',
        authorization: bearer(authorization, 'Org bearer'),
        body: JSON.stringify(body),
      });
    }),

  /** POST /api/org.createRole */
  createRole: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        name: z.string().min(2),
        description: z.string().optional(),
        permissions: z.array(z.string()).optional(),
        systemCode: orgRoleCode.nullable().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, ...body } = input;
      return saasFetch('/org/role/create', {
        method: 'POST',
        authorization: bearer(authorization, 'Org bearer'),
        body: JSON.stringify(body),
      });
    }),

  /** POST /api/org.updateModules */
  updateModules: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        modules: z.array(moduleToggleInput).min(1),
      }),
    )
    .mutation(({ input }) =>
      saasFetch('/org/modules/update', {
        method: 'POST',
        authorization: bearer(input.authorization, 'Org bearer'),
        body: JSON.stringify({ modules: input.modules }),
      }),
    ),

  /** GET /api/org.getOrganization */
  getOrganization: publicProcedure
    .input(z.object({ authorization: authorizationField, orgId: z.string().uuid() }))
    .query(({ input }) =>
      saasFetch(`/org/${input.orgId}`, {
        authorization: bearer(input.authorization, 'Org bearer'),
      }),
    ),

  /** GET /api/org.getUsers */
  getUsers: publicProcedure
    .input(z.object({ authorization: authorizationField, orgId: z.string().uuid() }))
    .query(({ input }) =>
      saasFetch(`/org/${input.orgId}/users`, {
        authorization: bearer(input.authorization, 'Org bearer'),
      }),
    ),

  /** GET /api/org.getRoles */
  getRoles: publicProcedure
    .input(z.object({ authorization: authorizationField, orgId: z.string().uuid() }))
    .query(({ input }) =>
      saasFetch(`/org/${input.orgId}/roles`, {
        authorization: bearer(input.authorization, 'Org bearer'),
      }),
    ),

  /** GET /api/org.getModules */
  getModules: publicProcedure
    .input(z.object({ authorization: authorizationField, orgId: z.string().uuid() }))
    .query(({ input }) =>
      saasFetch(`/org/${input.orgId}/modules`, {
        authorization: bearer(input.authorization, 'Org bearer'),
      }),
    ),

  // --- backward-compatible aliases ---
  create: publicProcedure.input(orgCreateInput).mutation(({ input }) =>
    saasFetch('/org/create', { method: 'POST', body: JSON.stringify(input) }),
  ),
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid(), authorization: authorizationField }))
    .query(({ input }) =>
      saasFetch(`/org/${input.id}`, {
        authorization: bearer(input.authorization, 'Org bearer'),
      }),
    ),
  listUsers: publicProcedure
    .input(z.object({ id: z.string().uuid(), authorization: authorizationField }))
    .query(({ input }) =>
      saasFetch(`/org/${input.id}/users`, {
        authorization: bearer(input.authorization, 'Org bearer'),
      }),
    ),
  listModules: publicProcedure
    .input(z.object({ id: z.string().uuid(), authorization: authorizationField }))
    .query(({ input }) =>
      saasFetch(`/org/${input.id}/modules`, {
        authorization: bearer(input.authorization, 'Org bearer'),
      }),
    ),
});

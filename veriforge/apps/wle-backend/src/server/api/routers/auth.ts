import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { saasFetch } from './_saas';
import { authorizationField, loginInput, orgCreateInput } from './_schemas';

export const authRouter = createTRPCRouter({
  /** POST /api/auth.login — organization namespace */
  login: publicProcedure.input(loginInput).mutation(({ input }) =>
    saasFetch('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  ),

  /** POST /api/auth.register — org signup via SaaS auth */
  register: publicProcedure
    .input(
      orgCreateInput.extend({
        selectedModules: orgCreateInput.shape.selectedModules,
      }),
    )
    .mutation(({ input }) =>
      saasFetch('/auth/signup', { method: 'POST', body: JSON.stringify(input) }),
    ),

  /** POST /api/auth.clientLogin */
  clientLogin: publicProcedure.input(loginInput).mutation(({ input }) =>
    saasFetch('/client/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  ),

  /** POST /api/auth.developerLogin */
  developerLogin: publicProcedure.input(loginInput).mutation(({ input }) =>
    saasFetch('/developer/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  ),

  /** POST /api/auth.logout */
  logout: publicProcedure
    .input(
      z.object({
        refreshToken: z.string().optional(),
        authorization: authorizationField.optional(),
      }),
    )
    .mutation(({ input }) =>
      saasFetch('/auth/logout', {
        method: 'POST',
        authorization: input.authorization,
        body: JSON.stringify({ refreshToken: input.refreshToken }),
      }),
    ),

  /** GET /api/auth.me */
  me: publicProcedure
    .input(z.object({ authorization: authorizationField }))
    .query(({ input }) =>
      saasFetch('/auth/me', { authorization: input.authorization }),
    ),
});

import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { bearer, saasFetch } from './_saas';
import { authorizationField } from './_schemas';

/**
 * VeriForge notification engine — proxies to SaaS `/notifications`.
 */
export const notificationsRouter = createTRPCRouter({
  getNotifications: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        orgId: z.string().uuid().optional(),
        skip: z.number().int().min(0).optional(),
        take: z.number().int().min(1).max(100).optional(),
        unreadOnly: z.boolean().optional(),
      }),
    )
    .query(async ({ input }) => {
      const auth = bearer(input.authorization);
      const qs = new URLSearchParams();
      if (input.skip != null) qs.set('skip', String(input.skip));
      if (input.take != null) qs.set('take', String(input.take));
      if (input.unreadOnly) qs.set('unreadOnly', 'true');
      const q = qs.toString();
      return saasFetch<{
        items: unknown[];
        total: number;
        unread: number;
      }>(`/notifications${q ? `?${q}` : ''}`, { authorization: auth });
    }),

  getOrgNotifications: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        skip: z.number().int().min(0).optional(),
        take: z.number().int().min(1).max(100).optional(),
      }),
    )
    .query(async ({ input }) => {
      const auth = bearer(input.authorization);
      const qs = new URLSearchParams();
      if (input.skip != null) qs.set('skip', String(input.skip));
      if (input.take != null) qs.set('take', String(input.take));
      const q = qs.toString();
      return saasFetch(`/notifications/org${q ? `?${q}` : ''}`, {
        authorization: auth,
      });
    }),

  markAsRead: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        ids: z.array(z.string().uuid()).min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const auth = bearer(input.authorization);
      return saasFetch<{ updated: number }>('/notifications/read', {
        method: 'POST',
        authorization: auth,
        body: JSON.stringify({ ids: input.ids }),
      });
    }),

  sendEmail: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        to: z.string().email(),
        subject: z.string().min(1).max(200),
        body: z.string().min(1).max(20_000),
      }),
    )
    .mutation(async ({ input }) => {
      const auth = bearer(input.authorization);
      return saasFetch('/notifications/sendEmail', {
        method: 'POST',
        authorization: auth,
        body: JSON.stringify({
          to: input.to,
          subject: input.subject,
          body: input.body,
        }),
      });
    }),

  /** @deprecated alias — use sendEmail */
  sendNotification: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        to: z.string().email().optional(),
        subject: z.string().optional(),
        body: z.string().optional(),
        kind: z.string().optional(),
        orgId: z.string().uuid().optional(),
        payload: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const auth = bearer(input.authorization);
      if (!input.to || !input.subject || !input.body) {
        return {
          ok: true,
          note: 'Provide to/subject/body to queue email, or use domain triggers',
        };
      }
      return saasFetch('/notifications/sendEmail', {
        method: 'POST',
        authorization: auth,
        body: JSON.stringify({
          to: input.to,
          subject: input.subject,
          body: input.body,
        }),
      });
    }),
});

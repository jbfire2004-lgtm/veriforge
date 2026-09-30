import { z } from 'zod';

export const NotificationRowSchema = z.object({
  id: z.number(),
  userId: z.number().nullable(),
  channel: z.enum(['IN_APP', 'EMAIL', 'SMS', 'PUSH']),
  type: z.string(),
  title: z.string().nullable(),
  body: z.string().nullable(),
  payload: z.unknown(),
  status: z.enum(['PENDING', 'SENT', 'FAILED', 'READ']),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export const NotificationPreferencesSchema = z.object({
  userId: z.number(),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  inspectionDue: z.boolean(),
  competencyExpiry: z.boolean(),
  ppeExpiry: z.boolean(),
  maintenanceDue: z.boolean(),
  calibrationDue: z.boolean(),
  assignmentAlerts: z.boolean(),
  quietHoursStart: z.string().nullable(),
  quietHoursEnd: z.string().nullable(),
  phone: z.string().nullable(),
});

export const UnreadCountSchema = z.object({ count: z.number() });

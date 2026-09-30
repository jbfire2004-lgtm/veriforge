"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnreadCountSchema = exports.NotificationPreferencesSchema = exports.NotificationRowSchema = void 0;
const zod_1 = require("zod");
exports.NotificationRowSchema = zod_1.z.object({
    id: zod_1.z.number(),
    userId: zod_1.z.number().nullable(),
    channel: zod_1.z.enum(['IN_APP', 'EMAIL', 'SMS', 'PUSH']),
    type: zod_1.z.string(),
    title: zod_1.z.string().nullable(),
    body: zod_1.z.string().nullable(),
    payload: zod_1.z.unknown(),
    status: zod_1.z.enum(['PENDING', 'SENT', 'FAILED', 'READ']),
    readAt: zod_1.z.string().datetime().nullable(),
    createdAt: zod_1.z.string().datetime(),
});
exports.NotificationPreferencesSchema = zod_1.z.object({
    userId: zod_1.z.number(),
    emailEnabled: zod_1.z.boolean(),
    smsEnabled: zod_1.z.boolean(),
    pushEnabled: zod_1.z.boolean(),
    inAppEnabled: zod_1.z.boolean(),
    inspectionDue: zod_1.z.boolean(),
    competencyExpiry: zod_1.z.boolean(),
    ppeExpiry: zod_1.z.boolean(),
    maintenanceDue: zod_1.z.boolean(),
    calibrationDue: zod_1.z.boolean(),
    assignmentAlerts: zod_1.z.boolean(),
    quietHoursStart: zod_1.z.string().nullable(),
    quietHoursEnd: zod_1.z.string().nullable(),
    phone: zod_1.z.string().nullable(),
});
exports.UnreadCountSchema = zod_1.z.object({ count: zod_1.z.number() });

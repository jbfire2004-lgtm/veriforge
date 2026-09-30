import { z } from 'zod';
export declare const NotificationRowSchema: z.ZodObject<{
    id: z.ZodNumber;
    userId: z.ZodNullable<z.ZodNumber>;
    channel: z.ZodEnum<["IN_APP", "EMAIL", "SMS", "PUSH"]>;
    type: z.ZodString;
    title: z.ZodNullable<z.ZodString>;
    body: z.ZodNullable<z.ZodString>;
    payload: z.ZodUnknown;
    status: z.ZodEnum<["PENDING", "SENT", "FAILED", "READ"]>;
    readAt: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    status: "PENDING" | "SENT" | "FAILED" | "READ";
    id: number;
    body: string | null;
    createdAt: string;
    title: string | null;
    userId: number | null;
    channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
    readAt: string | null;
    payload?: unknown;
}, {
    type: string;
    status: "PENDING" | "SENT" | "FAILED" | "READ";
    id: number;
    body: string | null;
    createdAt: string;
    title: string | null;
    userId: number | null;
    channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
    readAt: string | null;
    payload?: unknown;
}>;
export declare const NotificationPreferencesSchema: z.ZodObject<{
    userId: z.ZodNumber;
    emailEnabled: z.ZodBoolean;
    smsEnabled: z.ZodBoolean;
    pushEnabled: z.ZodBoolean;
    inAppEnabled: z.ZodBoolean;
    inspectionDue: z.ZodBoolean;
    competencyExpiry: z.ZodBoolean;
    ppeExpiry: z.ZodBoolean;
    maintenanceDue: z.ZodBoolean;
    calibrationDue: z.ZodBoolean;
    assignmentAlerts: z.ZodBoolean;
    quietHoursStart: z.ZodNullable<z.ZodString>;
    quietHoursEnd: z.ZodNullable<z.ZodString>;
    phone: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: number;
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    inAppEnabled: boolean;
    inspectionDue: boolean;
    competencyExpiry: boolean;
    ppeExpiry: boolean;
    maintenanceDue: boolean;
    calibrationDue: boolean;
    assignmentAlerts: boolean;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    phone: string | null;
}, {
    userId: number;
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    inAppEnabled: boolean;
    inspectionDue: boolean;
    competencyExpiry: boolean;
    ppeExpiry: boolean;
    maintenanceDue: boolean;
    calibrationDue: boolean;
    assignmentAlerts: boolean;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    phone: string | null;
}>;
export declare const UnreadCountSchema: z.ZodObject<{
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    count: number;
}, {
    count: number;
}>;

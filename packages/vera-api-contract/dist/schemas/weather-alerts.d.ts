import { z } from "zod";
export declare const WalletWeatherAlertSchema: z.ZodObject<{
    alert_type: z.ZodString;
    severity: z.ZodString;
    headline: z.ZodString;
    description: z.ZodString;
    expires_at: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    severity: string;
    alert_type: string;
    headline: string;
    expires_at: string | null;
}, {
    description: string;
    severity: string;
    alert_type: string;
    headline: string;
    expires_at: string | null;
}>;
export declare const ActiveWeatherAlertSchema: z.ZodObject<{
    id: z.ZodString;
    alert_id: z.ZodString;
    zone_id: z.ZodString;
    alert_type: z.ZodString;
    severity: z.ZodString;
    headline: z.ZodString;
    description: z.ZodString;
    effective_at: z.ZodString;
    expires_at: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    severity: string;
    alert_type: string;
    headline: string;
    expires_at: string | null;
    alert_id: string;
    zone_id: string;
    effective_at: string;
}, {
    id: string;
    description: string;
    severity: string;
    alert_type: string;
    headline: string;
    expires_at: string | null;
    alert_id: string;
    zone_id: string;
    effective_at: string;
}>;
export declare const WeatherAlertSettingsSchema: z.ZodObject<{
    weatherNotificationsEnabled: z.ZodBoolean;
    weatherWalletDisplayEnabled: z.ZodBoolean;
    showWeatherAlerts: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    weatherNotificationsEnabled: boolean;
    weatherWalletDisplayEnabled: boolean;
    showWeatherAlerts: boolean;
}, {
    weatherNotificationsEnabled: boolean;
    weatherWalletDisplayEnabled: boolean;
    showWeatherAlerts: boolean;
}>;
export type WalletWeatherAlert = z.infer<typeof WalletWeatherAlertSchema>;
export type ActiveWeatherAlert = z.infer<typeof ActiveWeatherAlertSchema>;
export type WeatherAlertSettings = z.infer<typeof WeatherAlertSettingsSchema>;

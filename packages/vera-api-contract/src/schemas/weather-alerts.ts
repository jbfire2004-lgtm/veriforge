import { z } from "zod";

export const WalletWeatherAlertSchema = z.object({
  alert_type: z.string(),
  severity: z.string(),
  headline: z.string(),
  description: z.string(),
  expires_at: z.string().datetime().nullable(),
});

export const ActiveWeatherAlertSchema = z.object({
  id: z.string().uuid(),
  alert_id: z.string(),
  zone_id: z.string(),
  alert_type: z.string(),
  severity: z.string(),
  headline: z.string(),
  description: z.string(),
  effective_at: z.string().datetime(),
  expires_at: z.string().datetime().nullable(),
});

export const WeatherAlertSettingsSchema = z.object({
  weatherNotificationsEnabled: z.boolean(),
  weatherWalletDisplayEnabled: z.boolean(),
  showWeatherAlerts: z.boolean(),
});

export type WalletWeatherAlert = z.infer<typeof WalletWeatherAlertSchema>;
export type ActiveWeatherAlert = z.infer<typeof ActiveWeatherAlertSchema>;
export type WeatherAlertSettings = z.infer<typeof WeatherAlertSettingsSchema>;

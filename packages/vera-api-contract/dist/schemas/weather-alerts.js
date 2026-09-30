"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherAlertSettingsSchema = exports.ActiveWeatherAlertSchema = exports.WalletWeatherAlertSchema = void 0;
const zod_1 = require("zod");
exports.WalletWeatherAlertSchema = zod_1.z.object({
    alert_type: zod_1.z.string(),
    severity: zod_1.z.string(),
    headline: zod_1.z.string(),
    description: zod_1.z.string(),
    expires_at: zod_1.z.string().datetime().nullable(),
});
exports.ActiveWeatherAlertSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    alert_id: zod_1.z.string(),
    zone_id: zod_1.z.string(),
    alert_type: zod_1.z.string(),
    severity: zod_1.z.string(),
    headline: zod_1.z.string(),
    description: zod_1.z.string(),
    effective_at: zod_1.z.string().datetime(),
    expires_at: zod_1.z.string().datetime().nullable(),
});
exports.WeatherAlertSettingsSchema = zod_1.z.object({
    weatherNotificationsEnabled: zod_1.z.boolean(),
    weatherWalletDisplayEnabled: zod_1.z.boolean(),
    showWeatherAlerts: zod_1.z.boolean(),
});

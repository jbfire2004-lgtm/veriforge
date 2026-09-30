import { apiFetchJson } from "@/lib/api-fetch";
import type { WeatherAlertSettings, WalletWeatherAlert } from "@vera/api-contract";

export async function fetchWeatherSettings(): Promise<WeatherAlertSettings> {
  const row = await apiFetchJson<{
    weatherNotificationsEnabled: boolean;
    weatherWalletDisplayEnabled: boolean;
    showWeatherAlerts: boolean;
  }>("/api/v1/weather-alerts/settings");
  return {
    weatherNotificationsEnabled: row.weatherNotificationsEnabled,
    weatherWalletDisplayEnabled: row.weatherWalletDisplayEnabled,
    showWeatherAlerts: row.showWeatherAlerts,
  };
}

export async function updateWeatherSettings(
  patch: Partial<WeatherAlertSettings>
): Promise<WeatherAlertSettings> {
  const row = await apiFetchJson<{
    weatherNotificationsEnabled: boolean;
    weatherWalletDisplayEnabled: boolean;
    showWeatherAlerts: boolean;
  }>("/api/v1/weather-alerts/settings", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return {
    weatherNotificationsEnabled: row.weatherNotificationsEnabled,
    weatherWalletDisplayEnabled: row.weatherWalletDisplayEnabled,
    showWeatherAlerts: row.showWeatherAlerts,
  };
}

export async function fetchWorkerWeatherAlerts(
  workerId: number | string
): Promise<WalletWeatherAlert[]> {
  return apiFetchJson<WalletWeatherAlert[]>(
    `/api/v1/weather-alerts/wallet/${workerId}`
  );
}

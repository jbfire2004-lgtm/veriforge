import type { WeatherSnapshotDto } from "@vera/api-contract";

/** Public home / hub fallback when live weather API is offline. */
export const DEFAULT_PUBLIC_WEATHER: WeatherSnapshotDto = {
  region: "Western Canada",
  summary:
    "Monitor wind and temperature swings for at-height and outdoor concrete work. Confirm regional Environment Canada alerts before mobilizing crews.",
  temperatureC: -2,
  conditions: "Partly cloudy, gusty winds",
  alerts: [
    {
      id: "wind-watch-demo",
      title: "Wind watch — crane & lift planning",
      description:
        "Sustained winds 40–55 km/h forecast afternoon shift. Review lift plans, SRL leading-edge use, and man-basket restrictions.",
      severity: "WATCH",
      hazardType: "Wind",
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    },
    {
      id: "cold-stress-demo",
      title: "Cold stress advisory",
      description:
        "Wind chill below -15°C morning hours. Rotate warm-up breaks and inspect hydration for outdoor crews.",
      severity: "INFO",
      hazardType: "Temperature",
      startsAt: new Date().toISOString(),
      endsAt: null,
    },
  ],
};

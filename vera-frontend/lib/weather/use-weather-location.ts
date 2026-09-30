"use client";

import { useCallback, useEffect, useState } from "react";
import { geocodePlace } from "./weather-service";
import { DEFAULT_WEATHER_LOCATION } from "./weather-service";
import {
  readStoredWeatherLocation,
  writeStoredWeatherLocation,
} from "./location-storage";
import type { WeatherLocation } from "./types";
import { WEATHER_CACHE_MS } from "./types";

export type LocationState =
  | { status: "loading" }
  | { status: "ready"; location: WeatherLocation }
  | { status: "denied"; location: WeatherLocation }
  | { status: "error"; message: string };

export function useWeatherLocation() {
  const [state, setState] = useState<LocationState>({ status: "loading" });
  const [manualQuery, setManualQuery] = useState("");
  const [resolving, setResolving] = useState(false);

  const applyLocation = useCallback((loc: WeatherLocation) => {
    writeStoredWeatherLocation(loc);
    setState({ status: "ready", location: loc });
  }, []);

  useEffect(() => {
    const stored = readStoredWeatherLocation();
    if (stored) {
      setState({ status: "ready", location: stored });
      return;
    }

    if (!navigator.geolocation) {
      setState({ status: "denied", location: DEFAULT_WEATHER_LOCATION });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: "Your location",
        });
      },
      () => {
        setState({ status: "denied", location: DEFAULT_WEATHER_LOCATION });
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: WEATHER_CACHE_MS },
    );
  }, [applyLocation]);

  const resolveManual = useCallback(async () => {
    setResolving(true);
    try {
      const loc = await geocodePlace(manualQuery);
      if (!loc) {
        setState({ status: "error", message: "Location not found. Try a city name." });
        return;
      }
      applyLocation(loc);
      setManualQuery("");
    } catch {
      setState({ status: "error", message: "Could not resolve location." });
    } finally {
      setResolving(false);
    }
  }, [manualQuery, applyLocation]);

  const location =
    state.status === "ready" || state.status === "denied"
      ? state.location
      : state.status === "loading"
        ? DEFAULT_WEATHER_LOCATION
        : DEFAULT_WEATHER_LOCATION;

  return {
    state,
    location,
    manualQuery,
    setManualQuery,
    resolveManual,
    resolving,
    applyLocation,
    needsManualEntry: state.status === "denied" || state.status === "error",
  };
}

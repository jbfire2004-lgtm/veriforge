import { VeraDigitalTwinEngine } from "@vera/digital-twin";
import type { TwinEventPayload, TwinType } from "@vera/digital-twin";

const localEngine = new VeraDigitalTwinEngine();

export function getLocalTwinEngine() {
  return localEngine;
}

export function applyOfflineTwinEvent(event: TwinEventPayload, clientVersion: number) {
  localEngine.applyEventOffline(event, clientVersion);
}

export function syncOfflineTwin(type: TwinType, id: string) {
  return localEngine.syncOffline(type, id);
}

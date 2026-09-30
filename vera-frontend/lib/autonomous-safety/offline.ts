import { VeraAutonomousSafetyEngine } from "@vera/autonomous-safety";
import type { SafetyContextInput } from "@vera/autonomous-safety";

const engine = new VeraAutonomousSafetyEngine();

export function analyzeOfflineSafety(ctx: SafetyContextInput) {
  return engine.analyzeOffline(ctx);
}

export function syncOfflineSafety() {
  return engine.syncOffline();
}

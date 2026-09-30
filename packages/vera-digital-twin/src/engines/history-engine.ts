import type { DigitalTwin, TimelineEntry } from "../types";

export type HistorySnapshot = {
  twinId: string;
  twinType: string;
  at: string;
  state: Partial<DigitalTwin>;
};

export class TwinHistoryEngine {
  private snapshots: HistorySnapshot[] = [];

  record(twin: DigitalTwin): void {
    this.snapshots.push({
      twinId: twin.id,
      twinType: twin.type,
      at: new Date().toISOString(),
      state: {
        compliance: twin.compliance,
        risk: twin.risk,
        readiness: twin.readiness,
        predictions: twin.predictions,
      },
    });
    if (this.snapshots.length > 5000) {
      this.snapshots = this.snapshots.slice(-4000);
    }
  }

  forTwin(twinType: string, twinId: string, limit = 50): HistorySnapshot[] {
    return this.snapshots
      .filter((s) => s.twinType === twinType && s.twinId === twinId)
      .slice(-limit);
  }
}

import type { DigitalTwin } from "../types";

export class RealTimeSyncEngine {
  private subscribers = new Map<string, Set<(twin: DigitalTwin) => void>>();

  subscribe(type: string, id: string, fn: (twin: DigitalTwin) => void): () => void {
    const key = `${type}:${id}`;
    if (!this.subscribers.has(key)) this.subscribers.set(key, new Set());
    this.subscribers.get(key)!.add(fn);
    return () => this.subscribers.get(key)?.delete(fn);
  }

  publish(twin: DigitalTwin): void {
    const key = `${twin.type}:${twin.id}`;
    this.subscribers.get(key)?.forEach((fn) => fn(twin));
    this.subscribers.get(`${twin.type}:*`)?.forEach((fn) => fn(twin));
  }
}

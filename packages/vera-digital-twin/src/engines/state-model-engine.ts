import type { DigitalTwin, TwinType } from "../types";

export class StateModelEngine {
  private store = new Map<string, DigitalTwin>();

  key(type: TwinType, id: string): string {
    return `${type}:${id}`;
  }

  get(type: TwinType, id: string): DigitalTwin | undefined {
    return this.store.get(this.key(type, id));
  }

  set(twin: DigitalTwin): DigitalTwin {
    twin.updatedAt = new Date().toISOString();
    this.store.set(this.key(twin.type, twin.id), twin);
    return twin;
  }

  list(type?: TwinType): DigitalTwin[] {
    return [...this.store.values()].filter((t) => !type || t.type === type);
  }

  patch(type: TwinType, id: string, partial: Partial<DigitalTwin>): DigitalTwin | undefined {
    const existing = this.get(type, id);
    if (!existing) return undefined;
    return this.set({ ...existing, ...partial } as DigitalTwin);
  }
}

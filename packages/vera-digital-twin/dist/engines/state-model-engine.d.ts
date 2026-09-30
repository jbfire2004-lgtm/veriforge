import type { DigitalTwin, TwinType } from "../types";
export declare class StateModelEngine {
    private store;
    key(type: TwinType, id: string): string;
    get(type: TwinType, id: string): DigitalTwin | undefined;
    set(twin: DigitalTwin): DigitalTwin;
    list(type?: TwinType): DigitalTwin[];
    patch(type: TwinType, id: string, partial: Partial<DigitalTwin>): DigitalTwin | undefined;
}
//# sourceMappingURL=state-model-engine.d.ts.map
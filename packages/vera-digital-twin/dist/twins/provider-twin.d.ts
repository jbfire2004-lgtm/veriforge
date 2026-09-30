import type { ProviderTwinState } from "../types";
export type ProviderTwinInput = {
    id: string;
    name: string;
    approved?: boolean;
    instructorCount?: number;
    courseCount?: number;
    trainingVolume?: number;
    qualityScore?: number;
};
export declare function buildProviderTwin(input: ProviderTwinInput): ProviderTwinState;
//# sourceMappingURL=provider-twin.d.ts.map
import type { UnionHallTwinState } from "../types";
export type UnionHallTwinInput = {
    id: string;
    name: string;
    memberCount?: number;
    dispatchQueue?: number;
    readyForDispatch?: number;
    missingTraining?: number;
};
export declare function buildUnionHallTwin(input: UnionHallTwinInput): UnionHallTwinState;
//# sourceMappingURL=union-hall-twin.d.ts.map
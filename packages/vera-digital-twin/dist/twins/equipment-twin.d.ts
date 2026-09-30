import type { EquipmentTwinState } from "../types";
export type EquipmentTwinInput = {
    id: string;
    name: string;
    companyId?: string;
    projectIds?: string[];
    lockedOut?: boolean;
    overdueInspection?: boolean;
    failedInspections?: number;
    competencyRequired?: boolean;
    visionPlates?: number;
};
export declare function buildEquipmentTwin(input: EquipmentTwinInput): EquipmentTwinState;
//# sourceMappingURL=equipment-twin.d.ts.map
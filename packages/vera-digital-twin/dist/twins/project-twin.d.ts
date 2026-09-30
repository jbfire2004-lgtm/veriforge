import type { ProjectTwinState } from "../types";
export type ProjectTwinInput = {
    id: string;
    name: string;
    companyId: string;
    readiness?: number;
    workerCount?: number;
    equipmentCount?: number;
    missingWorkers?: number;
    missingEquipment?: number;
    missingTraining?: number;
    safetyDocs?: number;
};
export declare function buildProjectTwin(input: ProjectTwinInput): ProjectTwinState;
//# sourceMappingURL=project-twin.d.ts.map
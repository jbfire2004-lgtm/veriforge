import type { EquipmentScheduleInput, ProjectScheduleInput, WorkerScheduleInput } from "../types";
export declare function rankWorkersForProject(workers: WorkerScheduleInput[], project: ProjectScheduleInput, requiredSkills?: string[]): {
    workerId: string;
    score: number;
}[];
export declare function rankEquipmentForProject(equipment: EquipmentScheduleInput[], project: ProjectScheduleInput): {
    equipmentId: string;
    score: number;
}[];
//# sourceMappingURL=matching.d.ts.map
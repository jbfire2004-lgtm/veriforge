import type { ResourceAllocation, SchedulingContextInput } from "../types";
export declare class ResourceAllocationEngine {
    allocate(ctx: SchedulingContextInput, staffing: {
        workerAssignments: {
            workerId: string;
            projectId: string;
            score: number;
        }[];
        equipmentAssignments: {
            equipmentId: string;
            projectId: string;
            score: number;
        }[];
    }): ResourceAllocation;
}
//# sourceMappingURL=resource-allocation.d.ts.map
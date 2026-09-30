import type { WorkerTwinState } from "../types";
export type WorkerTwinInput = {
    id: string;
    name: string;
    companyId?: string;
    unionHallId?: string;
    projectIds?: string[];
    isCompliant?: boolean;
    expiringSoon?: boolean;
    expiredCount?: number;
    competencyGaps?: number;
    dispatchStatus?: WorkerTwinState["dispatchStatus"];
    walletItems?: number;
    visionDocs?: number;
    daysToExpiry?: number;
};
export declare function buildWorkerTwin(input: WorkerTwinInput): WorkerTwinState;
//# sourceMappingURL=worker-twin.d.ts.map
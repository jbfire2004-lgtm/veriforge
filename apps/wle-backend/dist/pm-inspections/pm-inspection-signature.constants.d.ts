export declare const PM_INSPECTION_SIGNATURE_ROLES: {
    readonly SUPERVISOR: "supervisor";
    readonly WORKER: "worker";
};
export type PmInspectionSignatureRole = (typeof PM_INSPECTION_SIGNATURE_ROLES)[keyof typeof PM_INSPECTION_SIGNATURE_ROLES];
export type RequiredSignatureDef = {
    role: string;
    label?: string;
};
export declare const DEFAULT_SUPERVISOR_SIGNATURE: RequiredSignatureDef;
export declare const DEFAULT_WORKER_SIGNATURE: RequiredSignatureDef;

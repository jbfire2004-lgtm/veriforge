export declare const SMS_WORKFLOW_ENTITIES: readonly ["flha", "jha", "inspection", "audit", "corrective-action", "investigation"];
export type SmsWorkflowEntity = (typeof SMS_WORKFLOW_ENTITIES)[number];
export declare const SMS_WORKFLOW_API_SURFACE: {
    readonly basePath: "/api/v1/pm/sms/workflows";
    readonly entities: readonly ["flha", "jha", "inspection", "audit", "corrective-action", "investigation"];
    readonly operations: readonly ["list", "create", "get", "patch", "submit"];
    readonly legacyPaths: {
        readonly flha: "/api/v1/pm/jha-flha";
        readonly jha: "/api/v1/pm/jha-flha";
        readonly inspection: "/api/v1/pm/inspections";
        readonly audit: "/api/v1/pm/inspections";
        readonly correctiveAction: "/api/v1/pm/corrective-actions";
        readonly investigation: "/api/v1/pm/incidents/:eventId/investigation";
        readonly sclHecaEnergy: "/api/v1/pm/sms";
    };
    readonly statusEnums: {
        readonly flha: readonly ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "LOCKED", "REJECTED"];
        readonly inspection: readonly ["draft", "in_progress", "submitted", "review_required", "approved", "rejected", "closed"];
        readonly correctiveAction: readonly ["draft", "open", "assigned", "in_progress", "verification_pending", "verified", "closed", "cancelled"];
        readonly investigation: readonly ["not_started", "evidence_gathering", "analysis", "root_cause", "capa_planning", "review", "closed"];
    };
};
export declare function parseSmsWorkflowEntity(value: string): SmsWorkflowEntity;
export declare function notImplemented(feature: string): never;

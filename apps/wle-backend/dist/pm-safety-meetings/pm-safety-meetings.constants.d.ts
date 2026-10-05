import { SafetyMeetingType } from '@prisma/client';
export declare const PM_MEETING_ROLES: readonly ["WORKER", "SUPERVISOR", "ADMIN", "SUPER_ADMIN", "COMPANY_ADMIN", "PROJECT_MANAGER"];
export declare const SUPERVISOR_MEETING_ROLES: readonly ["SUPERVISOR", "ADMIN", "SUPER_ADMIN", "COMPANY_ADMIN", "PROJECT_MANAGER"];
export declare const MEETING_TYPE_LABELS: Record<SafetyMeetingType, string>;
export declare const MEETING_STATUS_TRANSITIONS: Record<string, string[]>;
export declare const REVIEW_REQUIRED_TYPES: SafetyMeetingType[];
export declare const DEFAULT_TOPIC_CATEGORIES: readonly [{
    readonly code: "ppe";
    readonly name: "PPE";
    readonly sortOrder: 1;
}, {
    readonly code: "fall_protection";
    readonly name: "Fall Protection";
    readonly sortOrder: 2;
}, {
    readonly code: "confined_space";
    readonly name: "Confined Space";
    readonly sortOrder: 3;
}, {
    readonly code: "hot_work";
    readonly name: "Hot Work";
    readonly sortOrder: 4;
}, {
    readonly code: "electrical_safety";
    readonly name: "Electrical Safety";
    readonly sortOrder: 5;
}, {
    readonly code: "equipment_operation";
    readonly name: "Equipment Operation";
    readonly sortOrder: 6;
}, {
    readonly code: "housekeeping";
    readonly name: "Housekeeping";
    readonly sortOrder: 7;
}, {
    readonly code: "environmental";
    readonly name: "Environmental";
    readonly sortOrder: 8;
}, {
    readonly code: "behavioral_safety";
    readonly name: "Behavioral Safety";
    readonly sortOrder: 9;
}, {
    readonly code: "sif_heca";
    readonly name: "SIF / HECA";
    readonly sortOrder: 10;
}, {
    readonly code: "general";
    readonly name: "General";
    readonly sortOrder: 99;
}];
export declare const SOURCE_MODULE_TO_CAIL = "safety_meeting";
export declare const INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME = "Inspection Failure Review";
export declare const DEFAULT_INSPECTION_FAILURE_AGENDA: readonly [{
    readonly title: "Review failed checklist items";
    readonly isHighRisk: true;
    readonly discussionPoints: readonly ["Walk through each failed item and observed condition"];
}, {
    readonly title: "Identify root causes";
    readonly isHighRisk: false;
    readonly discussionPoints: readonly ["Contributing factors", "Energy types involved"];
}, {
    readonly title: "Agree corrective actions and owners";
    readonly isHighRisk: false;
    readonly discussionPoints: readonly ["Assign CAPA owners", "Set due dates"];
}, {
    readonly title: "Re-verify controls before return to work";
    readonly isHighRisk: true;
    readonly discussionPoints: readonly ["Confirm barriers restored", "Supervisor sign-off"];
}];

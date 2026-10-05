export declare const ADOPTION_EVENT_TYPES: {
    readonly WORKER_CREATED: "worker_created";
    readonly EQUIPMENT_CREATED: "equipment_created";
    readonly TRAINING_UPLOADED: "training_uploaded";
    readonly VERIFICATION_RUN: "verification_run";
    readonly DIGITAL_SIGNOFF_SUBMITTED: "digital_signoff_submitted";
    readonly INCIDENT_CREATED: "incident_created";
    readonly PROJECT_CREATED: "project_created";
    readonly JHA_CREATED: "jha_created";
    readonly FLHA_CREATED: "flha_created";
    readonly SIF_LOGGED: "sif_logged";
    readonly USER_LOGIN: "user_login";
};
export type AdoptionEventType = (typeof ADOPTION_EVENT_TYPES)[keyof typeof ADOPTION_EVENT_TYPES];
export declare const EVENT_TO_DAILY_FIELD: Partial<Record<AdoptionEventType, keyof DailyUsageFields>>;
export type DailyUsageFields = {
    trainingEvents: number;
    verificationEvents: number;
    signoffEvents: number;
    incidentEvents: number;
    projectEvents: number;
    jhaEvents: number;
    flhaEvents: number;
    sifEvents: number;
    equipmentEvents: number;
};
export declare const ADOPTION_CACHE_TTL_MS = 60000;

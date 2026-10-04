export const ADOPTION_EVENT_TYPES = {
  WORKER_CREATED: 'worker_created',
  EQUIPMENT_CREATED: 'equipment_created',
  TRAINING_UPLOADED: 'training_uploaded',
  VERIFICATION_RUN: 'verification_run',
  DIGITAL_SIGNOFF_SUBMITTED: 'digital_signoff_submitted',
  INCIDENT_CREATED: 'incident_created',
  PROJECT_CREATED: 'project_created',
  JHA_CREATED: 'jha_created',
  FLHA_CREATED: 'flha_created',
  SIF_LOGGED: 'sif_logged',
  USER_LOGIN: 'user_login',
} as const;

export type AdoptionEventType =
  (typeof ADOPTION_EVENT_TYPES)[keyof typeof ADOPTION_EVENT_TYPES];

/** Maps event_type → company_usage_daily column increment key */
export const EVENT_TO_DAILY_FIELD: Partial<
  Record<AdoptionEventType, keyof DailyUsageFields>
> = {
  [ADOPTION_EVENT_TYPES.TRAINING_UPLOADED]: 'trainingEvents',
  [ADOPTION_EVENT_TYPES.VERIFICATION_RUN]: 'verificationEvents',
  [ADOPTION_EVENT_TYPES.DIGITAL_SIGNOFF_SUBMITTED]: 'signoffEvents',
  [ADOPTION_EVENT_TYPES.INCIDENT_CREATED]: 'incidentEvents',
  [ADOPTION_EVENT_TYPES.PROJECT_CREATED]: 'projectEvents',
  [ADOPTION_EVENT_TYPES.JHA_CREATED]: 'jhaEvents',
  [ADOPTION_EVENT_TYPES.FLHA_CREATED]: 'flhaEvents',
  [ADOPTION_EVENT_TYPES.SIF_LOGGED]: 'sifEvents',
  [ADOPTION_EVENT_TYPES.EQUIPMENT_CREATED]: 'equipmentEvents',
};

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

export const ADOPTION_CACHE_TTL_MS = 60_000;

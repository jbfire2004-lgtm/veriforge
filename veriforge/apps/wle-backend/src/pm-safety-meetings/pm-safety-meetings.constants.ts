import { SafetyMeetingType } from '@prisma/client';

export const PM_MEETING_ROLES = [
  'WORKER',
  'SUPERVISOR',
  'ADMIN',
  'SUPER_ADMIN',
  'COMPANY_ADMIN',
  'PROJECT_MANAGER',
] as const;

export const SUPERVISOR_MEETING_ROLES = [
  'SUPERVISOR',
  'ADMIN',
  'SUPER_ADMIN',
  'COMPANY_ADMIN',
  'PROJECT_MANAGER',
] as const;

export const MEETING_TYPE_LABELS: Record<SafetyMeetingType, string> = {
  toolbox_talk: 'Toolbox Talk',
  tailgate_meeting: 'Tailgate Meeting',
  safety_stand_down: 'Safety Stand-Down',
  pre_task_meeting: 'Pre-Task Meeting',
  daily_safety_briefing: 'Daily Safety Briefing',
  weekly_safety_meeting: 'Weekly Safety Meeting',
  monthly_safety_meeting: 'Monthly Safety Meeting',
  project_kickoff_safety: 'Project Kickoff Safety Meeting',
  incident_review_meeting: 'Incident Review Meeting',
  custom: 'Custom',
};

/** Status transitions: from → allowed to[] */
export const MEETING_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['published', 'draft'],
  published: ['in_progress', 'draft'],
  in_progress: ['completed', 'published'],
  completed: ['reviewed', 'in_progress'],
  reviewed: ['locked', 'completed'],
  locked: [],
};

export const REVIEW_REQUIRED_TYPES: SafetyMeetingType[] = [
  'safety_stand_down',
  'incident_review_meeting',
];

export const DEFAULT_TOPIC_CATEGORIES = [
  { code: 'ppe', name: 'PPE', sortOrder: 1 },
  { code: 'fall_protection', name: 'Fall Protection', sortOrder: 2 },
  { code: 'confined_space', name: 'Confined Space', sortOrder: 3 },
  { code: 'hot_work', name: 'Hot Work', sortOrder: 4 },
  { code: 'electrical_safety', name: 'Electrical Safety', sortOrder: 5 },
  { code: 'equipment_operation', name: 'Equipment Operation', sortOrder: 6 },
  { code: 'housekeeping', name: 'Housekeeping', sortOrder: 7 },
  { code: 'environmental', name: 'Environmental', sortOrder: 8 },
  { code: 'behavioral_safety', name: 'Behavioral Safety', sortOrder: 9 },
  { code: 'sif_heca', name: 'SIF / HECA', sortOrder: 10 },
  { code: 'general', name: 'General', sortOrder: 99 },
] as const;

export const SOURCE_MODULE_TO_CAIL = 'safety_meeting';

export const INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME =
  'Inspection Failure Review';

export const DEFAULT_INSPECTION_FAILURE_AGENDA = [
  {
    title: 'Review failed checklist items',
    isHighRisk: true,
    discussionPoints: ['Walk through each failed item and observed condition'],
  },
  {
    title: 'Identify root causes',
    isHighRisk: false,
    discussionPoints: ['Contributing factors', 'Energy types involved'],
  },
  {
    title: 'Agree corrective actions and owners',
    isHighRisk: false,
    discussionPoints: ['Assign CAPA owners', 'Set due dates'],
  },
  {
    title: 'Re-verify controls before return to work',
    isHighRisk: true,
    discussionPoints: ['Confirm barriers restored', 'Supervisor sign-off'],
  },
] as const;

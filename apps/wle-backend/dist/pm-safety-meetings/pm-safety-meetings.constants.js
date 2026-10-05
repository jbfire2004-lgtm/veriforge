"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_INSPECTION_FAILURE_AGENDA = exports.INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME = exports.SOURCE_MODULE_TO_CAIL = exports.DEFAULT_TOPIC_CATEGORIES = exports.REVIEW_REQUIRED_TYPES = exports.MEETING_STATUS_TRANSITIONS = exports.MEETING_TYPE_LABELS = exports.SUPERVISOR_MEETING_ROLES = exports.PM_MEETING_ROLES = void 0;
exports.PM_MEETING_ROLES = [
    'WORKER',
    'SUPERVISOR',
    'ADMIN',
    'SUPER_ADMIN',
    'COMPANY_ADMIN',
    'PROJECT_MANAGER',
];
exports.SUPERVISOR_MEETING_ROLES = [
    'SUPERVISOR',
    'ADMIN',
    'SUPER_ADMIN',
    'COMPANY_ADMIN',
    'PROJECT_MANAGER',
];
exports.MEETING_TYPE_LABELS = {
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
exports.MEETING_STATUS_TRANSITIONS = {
    draft: ['published', 'draft'],
    published: ['in_progress', 'draft'],
    in_progress: ['completed', 'published'],
    completed: ['reviewed', 'in_progress'],
    reviewed: ['locked', 'completed'],
    locked: [],
};
exports.REVIEW_REQUIRED_TYPES = [
    'safety_stand_down',
    'incident_review_meeting',
];
exports.DEFAULT_TOPIC_CATEGORIES = [
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
];
exports.SOURCE_MODULE_TO_CAIL = 'safety_meeting';
exports.INSPECTION_FAILURE_REVIEW_TEMPLATE_NAME = 'Inspection Failure Review';
exports.DEFAULT_INSPECTION_FAILURE_AGENDA = [
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
];
//# sourceMappingURL=pm-safety-meetings.constants.js.map
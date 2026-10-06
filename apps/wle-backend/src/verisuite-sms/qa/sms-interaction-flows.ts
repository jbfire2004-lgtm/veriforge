/**
 * VeriSuite SMS — Full Interaction Flows (FINAL).
 * Executable catalog: user actions, system responses, AI triggers,
 * validation, errors, success states, role variations.
 * Source: VeriSuite-SMS-Full-Interaction-Flows canvas.
 */

import { SMS_BEHAVIORS } from '../constants';

export type SmsFlowRole =
  | 'WORKER'
  | 'SUPERVISOR'
  | 'HSE'
  | 'PM'
  | 'COMPANY_ADMIN'
  | 'SUBCONTRACTOR_ADMIN'
  | 'AUDITOR'
  | 'INVESTIGATOR'
  | 'INSPECTOR'
  | 'OWNER'
  | 'ANY_READER';

export type SmsFlowErrorCode =
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'BUSINESS_RULE'
  | 'UPSTREAM_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'NOT_FOUND'
  | 'OFFLINE_QUEUE';

export type SmsFlowStep = {
  id: string;
  userAction: string;
  systemResponse: string;
  /** AI behavior ids and/or validation rules */
  aiOrValidation: string;
  aiTriggers?: string[];
  api?: { method: 'GET' | 'POST' | 'PUT'; path: string };
  validation?: string[];
};

export type SmsFlowRoleVariation = {
  role: SmsFlowRole;
  variation: string;
  canWrite?: boolean;
  canApprove?: boolean;
};

export type SmsInteractionFlow = {
  id: string;
  name: string;
  entry: string;
  route: string;
  intelligencePage: string;
  rolesSummary: string;
  aiTriggers: string[];
  success: string;
  errors: Array<{ code: SmsFlowErrorCode; ux: string }>;
  steps: SmsFlowStep[];
  roleVariations: SmsFlowRoleVariation[];
  dodChecks: string[];
  /** Optional sub-flows (e.g. ERP drill, find-in-emergency) */
  branches?: Array<{ id: string; name: string; steps: SmsFlowStep[] }>;
};

export const SMS_FLOW_SHARED_PATTERNS = [
  {
    id: 'ai_suggest',
    behavior:
      'Panel/modal + confidence; Accept / Dismiss → /intelligence/accept or domain accept; audited',
  },
  {
    id: 'validation',
    behavior: 'Client inline → API 400 field map; 422 business rules as banners',
  },
  {
    id: 'concurrency',
    behavior: 'rowVersion on PUT; 409 → reload + diff prompt',
  },
  {
    id: 'idempotency',
    behavior: 'Idempotency-Key on create; duplicate soft-replays prior response',
  },
  {
    id: 'success',
    behavior:
      'Toast + navigate or stay; insight strip refresh; metrics eventual ≤5m',
  },
  {
    id: 'forbidden',
    behavior: '403 page or inline; no data leak across plane/sub',
  },
  {
    id: 'empty_states',
    behavior: 'Explain + CTA; intelligence never blank (fallback tips)',
  },
  {
    id: 'nav_deep_links',
    behavior: 'Module dropdown / GlobalNav — no “← back to module”',
  },
] as const;

export const SMS_FLOW_VALIDATION_MATRIX = [
  {
    condition: 'Missing required field',
    ux: 'Inline red + focus first',
    system: '400 VALIDATION_ERROR details[]',
  },
  {
    condition: 'Business rule (quality fail, verify required)',
    ux: 'Banner + fix list',
    system: '422 BUSINESS_RULE',
  },
  {
    condition: 'Stale rowVersion',
    ux: 'Modal reload/diff',
    system: '409 CONFLICT',
  },
  {
    condition: 'No access',
    ux: 'Forbidden panel',
    system: '403; security audit',
  },
  {
    condition: 'Upstream EMS/LLM/FieldOS',
    ux: 'Fallback banner + degraded mode',
    system: '502; source=fallback',
  },
  {
    condition: 'Metrics lag',
    ux: 'Stale chip + computedAt',
    system: '503 or 200 cached',
  },
  {
    condition: 'Network offline',
    ux: 'Queue badge; local draft',
    system: 'Retry with idempotency',
  },
  {
    condition: 'Suppressed benchmark/competency cell',
    ux: 'Unavailable / n<5 message',
    system: '200 suppressed:true',
  },
] as const;

export const SMS_CROSS_LINK_MAP = [
  {
    from: 'Home insight',
    nextAction: 'open_incident_log',
    to: '/pm/incidents',
  },
  {
    from: 'Incident RCA',
    nextAction: 'create_action',
    to: '/pm/action-management',
  },
  {
    from: 'JHA high residual',
    nextAction: 'generate_erp',
    to: '/pm/emergency-response',
  },
  {
    from: 'FLHA energy gap',
    nextAction: 'create_focus_pack',
    to: '/pm/inspections',
  },
  {
    from: 'Overdue actions',
    nextAction: 'schedule_meeting',
    to: '/pm/safety-meetings',
  },
  {
    from: 'Low drill readiness',
    nextAction: 'run_erp_drill',
    to: '/pm/emergency-response',
  },
  {
    from: 'Competency gap',
    nextAction: 'open_competency',
    to: '/pm/training',
  },
  {
    from: 'Regional hotspot',
    nextAction: 'drill_child',
    to: '/pm',
  },
] as const;

export const SMS_INTERACTION_FLOWS: SmsInteractionFlow[] = [
  {
    id: 'create-incident',
    name: 'Creating an incident',
    entry:
      '/pm/incidents → Report incident · FieldOS quick report · intelligence CTA',
    route: '/pm/incidents',
    intelligencePage: 'incidents',
    rolesSummary: 'Worker+ can create; high severity notifies HSE/PM',
    aiTriggers: [SMS_BEHAVIORS.CROSS_PAGE],
    success:
      'Incident in smart log as open; toast with ID; Investigate CTA; open-count KPI +1 (eventual)',
    errors: [
      { code: 'VALIDATION_ERROR', ux: '400 field errors inline' },
      { code: 'FORBIDDEN', ux: '403 forbidden panel' },
      {
        code: 'CONFLICT',
        ux: '409 duplicate clientRequestId returns existing',
      },
      { code: 'OFFLINE_QUEUE', ux: 'offline draft + retry queue' },
    ],
    steps: [
      {
        id: '1',
        userAction: 'Clicks Report incident',
        systemResponse: 'Opens intake wizard (/pm/incidents/new)',
        aiOrValidation: 'Required: type, severity, occurredAt, description',
        validation: ['type', 'severity', 'occurredAt', 'description'],
      },
      {
        id: '2',
        userAction: 'Fills type, severity, time, location, description',
        systemResponse: 'Live validation; SIF/HECA hint banner if triggered',
        aiOrValidation: 'D0 SIF/HECA scan',
      },
      {
        id: '3',
        userAction: 'Adds people / equipment (optional)',
        systemResponse: 'Worker lookup scoped to plane/tenant',
        aiOrValidation: 'Reject IDs outside tenant',
      },
      {
        id: '4',
        userAction: 'Submits',
        systemResponse: 'POST /sms/incidents → 201; redirect detail or log',
        aiOrValidation: 'Idempotency-Key; required fields',
        api: { method: 'POST', path: '/incidents' },
        validation: ['projectId', 'title', 'type', 'severity'],
      },
      {
        id: '5',
        userAction: 'Sees confirmation',
        systemResponse: 'Success toast; smart log row; strip Open +1',
        aiOrValidation: 'AI-17 home signal',
        aiTriggers: [SMS_BEHAVIORS.CROSS_PAGE],
      },
    ],
    roleVariations: [
      {
        role: 'WORKER',
        variation:
          'Create only; limited fields; no severity override past policy max without Supervisor',
        canWrite: true,
      },
      {
        role: 'SUPERVISOR',
        variation: 'Full intake; can assign investigator',
        canWrite: true,
      },
      {
        role: 'HSE',
        variation: 'Create + immediate investigate path; company-plane create',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'PM',
        variation: 'Create + immediate investigate path',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'SUBCONTRACTOR_ADMIN',
        variation: 'Create scoped to own subcontractor_company_id',
        canWrite: true,
      },
      { role: 'AUDITOR', variation: 'No create', canWrite: false },
    ],
    dodChecks: ['Smart log row + toast ID + open KPI path'],
  },
  {
    id: 'investigate-incident',
    name: 'Investigating an incident',
    entry: 'Incident detail · Smart log → Details · Investigation tab',
    route: '/pm/incidents',
    intelligencePage: 'incidents',
    rolesSummary: 'Assigned investigator, HSE, PM',
    aiTriggers: [
      SMS_BEHAVIORS.INVESTIGATION,
      SMS_BEHAVIORS.ROOT_CAUSE,
      SMS_BEHAVIORS.ACTION_CORRECTIVE,
      SMS_BEHAVIORS.ACTION_PREVENTIVE,
      SMS_BEHAVIORS.MEETING_TOPICS,
    ],
    success:
      'Investigation complete/closed; RCA saved; corrective/preventive actions linked; optional meeting/inspection offers',
    errors: [
      { code: 'BUSINESS_RULE', ux: '422 incomplete close' },
      { code: 'CONFLICT', ux: '409 version' },
      { code: 'UPSTREAM_ERROR', ux: 'helper 502 → D0 how-to only' },
      { code: 'FORBIDDEN', ux: '403 not assigned' },
    ],
    steps: [
      {
        id: '1',
        userAction: 'Opens incident; Start investigation',
        systemResponse: 'PUT status=investigating; show checklist',
        aiOrValidation: 'AI-10 loads (D0 + optional L2 draft)',
        aiTriggers: [SMS_BEHAVIORS.INVESTIGATION],
        api: { method: 'PUT', path: '/incidents/:id/investigation' },
      },
      {
        id: '2',
        userAction: 'Reviews how-to / questions / evidence list',
        systemResponse: 'Helper panel; editable notes',
        aiOrValidation: 'PII minimized in LLM path',
        api: { method: 'POST', path: '/incidents/:id/investigation/helper' },
        aiTriggers: [SMS_BEHAVIORS.INVESTIGATION],
      },
      {
        id: '3',
        userAction: 'Clicks Suggest root causes',
        systemResponse: 'POST …/root-causes/suggest',
        aiOrValidation: 'AI-11 confidence list',
        api: { method: 'POST', path: '/incidents/:id/root-causes/suggest' },
        aiTriggers: [SMS_BEHAVIORS.ROOT_CAUSE],
      },
      {
        id: '4',
        userAction: 'Accepts root cause(s)',
        systemResponse: 'Saves taxonomy IDs; audit suggestionId',
        aiOrValidation: 'Must map to taxonomy; accept before SoR',
        api: { method: 'POST', path: '/intelligence/accept' },
      },
      {
        id: '5',
        userAction: 'Requests action suggestions',
        systemResponse: 'POST /sms/actions/suggest',
        aiOrValidation: 'AI-12 / AI-13',
        api: { method: 'POST', path: '/actions/suggest' },
        aiTriggers: [
          SMS_BEHAVIORS.ACTION_CORRECTIVE,
          SMS_BEHAVIORS.ACTION_PREVENTIVE,
        ],
      },
      {
        id: '6',
        userAction: 'Creates actions / links meeting',
        systemResponse: 'POST /actions; optional topics/generate',
        aiOrValidation: 'Owner + dueAt SLA required',
        api: { method: 'POST', path: '/actions' },
      },
      {
        id: '7',
        userAction: 'Completes evidence; submit close/review',
        systemResponse: 'PUT investigation; gate required fields',
        aiOrValidation: '422 if RCA/evidence missing',
        api: { method: 'PUT', path: '/incidents/:id/investigation' },
        validation: ['rootCauseIds', 'findings'],
      },
    ],
    roleVariations: [
      {
        role: 'INVESTIGATOR',
        variation: 'Full helper + RCA + draft actions; close policy gated',
        canWrite: true,
      },
      {
        role: 'HSE',
        variation: 'All steps + close/approve; can reassign',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'PM',
        variation: 'Read + comment; approve close on project policy',
        canApprove: true,
      },
      {
        role: 'SUPERVISOR',
        variation: 'Read + add evidence; no RCA accept unless delegated',
      },
      {
        role: 'WORKER',
        variation: 'Witness statement only if invited',
        canWrite: false,
      },
    ],
    dodChecks: [
      'RCA persisted + ≥0 actions or explicit skip reason + status advanced',
    ],
  },
  {
    id: 'create-jha',
    name: 'Creating a JHA',
    entry: '/pm/jha-flha → Smart Builder / Browse templates',
    route: '/pm/jha-flha',
    intelligencePage: 'jha-flha',
    rolesSummary: 'HSE, PM, Supervisor (policy)',
    aiTriggers: [
      SMS_BEHAVIORS.JHA_BUILDER,
      SMS_BEHAVIORS.JHA_RISK,
      SMS_BEHAVIORS.CROSS_PAGE,
    ],
    success:
      'JHA draft saved (versioned); quality + risk rank visible; optional ERP generate handoff',
    errors: [
      { code: 'VALIDATION_ERROR', ux: '400' },
      { code: 'NOT_FOUND', ux: '404 template' },
      {
        code: 'BUSINESS_RULE',
        ux: '422 high residual without ERP when policy requires',
      },
    ],
    steps: [
      {
        id: '1',
        userAction: 'Opens templates or Smart Builder',
        systemResponse: 'GET /jha/templates',
        aiOrValidation: 'Filter industry/workType',
        api: { method: 'GET', path: '/jha/templates' },
      },
      {
        id: '2',
        userAction: 'Selects template / work type + energies',
        systemResponse: 'Loads template detail',
        aiOrValidation: 'Validate template in tenant library',
        api: { method: 'GET', path: '/jha/templates/:templateId' },
      },
      {
        id: '3',
        userAction: 'Clicks Auto-suggest; Accept sections',
        systemResponse: 'POST /jha/suggest → fill editor',
        aiOrValidation: 'AI-04; per-section accept',
        api: { method: 'POST', path: '/jha/suggest' },
        aiTriggers: [SMS_BEHAVIORS.JHA_BUILDER],
      },
      {
        id: '4',
        userAction: 'Edits tasks/hazards/controls/PPE',
        systemResponse: 'Dirty state; orphan-control warnings',
        aiOrValidation: 'Each control maps to hazard',
      },
      {
        id: '5',
        userAction: 'Saves draft / Creates JHA',
        systemResponse: 'POST /jha → draft',
        aiOrValidation: 'Required title, ≥1 task, ≥1 hazard',
        api: { method: 'POST', path: '/jha' },
        validation: ['projectId', 'title', 'workType'],
      },
      {
        id: '6',
        userAction: 'Runs Risk rank',
        systemResponse: 'POST /jha/{id}/risk-rank',
        aiOrValidation: 'AI-05 D0/D1 only',
        api: { method: 'POST', path: '/jha/:id/risk-rank' },
        aiTriggers: [SMS_BEHAVIORS.JHA_RISK],
      },
      {
        id: '7',
        userAction: 'Optional: Generate ERP',
        systemResponse: 'Navigate ERP with scenario prefill',
        aiOrValidation: 'Cross-page intelligence',
        aiTriggers: [SMS_BEHAVIORS.CROSS_PAGE],
      },
    ],
    roleVariations: [
      {
        role: 'HSE',
        variation: 'Create + approve path available',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'PM',
        variation: 'Create + approve on project',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'SUPERVISOR',
        variation: 'Create draft only if policy; cannot approve',
        canWrite: true,
      },
      { role: 'WORKER', variation: 'No create', canWrite: false },
      { role: 'AUDITOR', variation: 'Read templates/records only' },
    ],
    dodChecks: ['Draft id + version + risk rank panel'],
  },
  {
    id: 'update-jha',
    name: 'Updating a JHA',
    entry: 'JHA detail → Edit · version bump on approve',
    route: '/pm/jha-flha',
    intelligencePage: 'jha-flha',
    rolesSummary: 'Editors; Approve: HSE/PM',
    aiTriggers: [SMS_BEHAVIORS.JHA_BUILDER, SMS_BEHAVIORS.JHA_RISK],
    success:
      'Updated draft or new approved version; linked FLHAs warned if breaking change',
    errors: [
      { code: 'CONFLICT', ux: '409 rowVersion' },
      { code: 'FORBIDDEN', ux: '403 approve denied' },
      {
        code: 'BUSINESS_RULE',
        ux: '422 ERP required for high residual',
      },
    ],
    steps: [
      {
        id: '1',
        userAction: 'Opens JHA; Edit',
        systemResponse: 'Editable copy of current version',
        aiOrValidation: 'Lock if another editor (optional soft lock)',
        api: { method: 'GET', path: '/jha/:id' },
      },
      {
        id: '2',
        userAction: 'Changes tasks/controls; optional Re-suggest',
        systemResponse: 'Dirty; AI-04 optional',
        aiOrValidation: 'Orphan controls blocked on save',
        aiTriggers: [SMS_BEHAVIORS.JHA_BUILDER],
      },
      {
        id: '3',
        userAction: 'Saves draft',
        systemResponse: 'PUT /jha/{id} status=draft',
        aiOrValidation: 'rowVersion check',
        api: { method: 'PUT', path: '/jha/:id' },
        validation: ['rowVersion'],
      },
      {
        id: '4',
        userAction: 'Re-runs risk rank',
        systemResponse: 'POST risk-rank',
        aiOrValidation: 'AI-05; SIF flags',
        api: { method: 'POST', path: '/jha/:id/risk-rank' },
        aiTriggers: [SMS_BEHAVIORS.JHA_RISK],
      },
      {
        id: '5',
        userAction: 'Submit for approval / Approve',
        systemResponse: 'PUT in_review|approved; version++',
        aiOrValidation: 'Notify FLHA owners if breaking',
        api: { method: 'PUT', path: '/jha/:id' },
      },
    ],
    roleVariations: [
      {
        role: 'HSE',
        variation: 'Edit + approve; can force ERP link',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'PM',
        variation: 'Edit + approve; can force ERP link',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'SUPERVISOR',
        variation: 'Edit draft if owner; no approve',
        canWrite: true,
      },
      { role: 'AUDITOR', variation: 'Read-only diff/history' },
    ],
    dodChecks: ['New version or draft save + FLHA warn if breaking'],
  },
  {
    id: 'create-flha',
    name: 'Creating an FLHA',
    entry: '/pm/jha-flha → New FLHA · FieldOS',
    route: '/pm/jha-flha',
    intelligencePage: 'jha-flha',
    rolesSummary: 'Supervisor, Worker (crew), Sub Admin',
    aiTriggers: [SMS_BEHAVIORS.FLHA_HAZARDS, SMS_BEHAVIORS.FLHA_QUALITY],
    success:
      'FLHA active; quality band pass/warn; sign-ins recorded; FieldOS sync queued',
    errors: [
      {
        code: 'BUSINESS_RULE',
        ux: '422 fail band blocks FieldOS push',
      },
      { code: 'VALIDATION_ERROR', ux: '400' },
      { code: 'UPSTREAM_ERROR', ux: 'FieldOS 502 → pending retry' },
    ],
    steps: [
      {
        id: '1',
        userAction: 'New FLHA; picks approved JHA + work/location/crew',
        systemResponse: 'Prefill from JHA',
        aiOrValidation: 'Reject unapproved JHA',
      },
      {
        id: '2',
        userAction: 'Adjusts Energy Wheel / hazards',
        systemResponse: 'Live coverage UI',
        aiOrValidation: 'Optional AI-02 on blur',
        aiTriggers: [SMS_BEHAVIORS.FLHA_HAZARDS],
      },
      {
        id: '3',
        userAction: 'Accepts predicted hazards (optional)',
        systemResponse: 'Flags applied to form',
        aiOrValidation: 'Human accept required',
        api: { method: 'POST', path: '/intelligence/accept' },
      },
      {
        id: '4',
        userAction: 'Adds workers / sign-ins',
        systemResponse: 'Gate-log match preview',
        aiOrValidation: 'Warn mismatch %',
      },
      {
        id: '5',
        userAction: 'Submits',
        systemResponse: 'POST /flha',
        aiOrValidation: 'Required energies, hazards, PPE, workers',
        api: { method: 'POST', path: '/flha' },
        validation: ['projectId', 'hazards'],
      },
      {
        id: '6',
        userAction: 'Auto score',
        systemResponse: 'POST /flha/{id}/score',
        aiOrValidation: 'AI-03 band pass|warn|fail',
        api: { method: 'POST', path: '/flha/:id/score' },
        aiTriggers: [SMS_BEHAVIORS.FLHA_QUALITY],
      },
      {
        id: '7',
        userAction: 'If fail: fix gaps; rescore',
        systemResponse: 'PUT then score',
        aiOrValidation: '422 blocks FieldOS if policy',
        api: { method: 'PUT', path: '/flha/:id' },
      },
    ],
    roleVariations: [
      {
        role: 'WORKER',
        variation: 'Create for own crew; limited edit after active',
        canWrite: true,
      },
      {
        role: 'SUPERVISOR',
        variation: 'Full create + override warn with reason',
        canWrite: true,
      },
      {
        role: 'SUBCONTRACTOR_ADMIN',
        variation: 'Own sub crew only',
        canWrite: true,
      },
      {
        role: 'HSE',
        variation: 'Can create any project crew; review queue after',
        canWrite: true,
      },
    ],
    dodChecks: ['Band shown + FieldOS status pending/synced'],
  },
  {
    id: 'review-flha',
    name: 'Reviewing an FLHA',
    entry: 'FLHA list / AI review queue → open',
    route: '/pm/jha-flha',
    intelligencePage: 'jha-flha',
    rolesSummary: 'HSE, Supervisor, PM',
    aiTriggers: [
      SMS_BEHAVIORS.FLHA_HAZARDS,
      SMS_BEHAVIORS.FLHA_QUALITY,
      SMS_BEHAVIORS.INSPECTION_FOCUS,
    ],
    success:
      'Flags resolved/accepted; quality improved; optional focus pack created; queue −1',
    errors: [
      { code: 'UPSTREAM_ERROR', ux: 'Score timeout → rules-only notes' },
      { code: 'FORBIDDEN', ux: '403' },
      { code: 'CONFLICT', ux: '409' },
    ],
    steps: [
      {
        id: '1',
        userAction: 'Opens FLHA in review queue',
        systemResponse: 'GET /flha/{id} + prior AI flags',
        aiOrValidation: 'Show qualityBand',
        api: { method: 'GET', path: '/flha/:id' },
      },
      {
        id: '2',
        userAction: 'Runs AI review',
        systemResponse: 'POST score + hazard prediction',
        aiOrValidation: 'AI-02 + AI-03',
        api: { method: 'POST', path: '/flha/:id/score' },
        aiTriggers: [SMS_BEHAVIORS.FLHA_HAZARDS, SMS_BEHAVIORS.FLHA_QUALITY],
      },
      {
        id: '3',
        userAction: 'Accepts / dismisses flags',
        systemResponse: 'POST /intelligence/accept',
        aiOrValidation: 'Audit each flag',
        api: { method: 'POST', path: '/intelligence/accept' },
      },
      {
        id: '4',
        userAction: 'May spawn inspection focus',
        systemResponse: 'POST /inspections/focus-packs',
        aiOrValidation: 'AI-08',
        api: { method: 'POST', path: '/inspections/focus-packs' },
        aiTriggers: [SMS_BEHAVIORS.INSPECTION_FOCUS],
      },
      {
        id: '5',
        userAction: 'Marks review complete',
        systemResponse: 'PUT review notes/status',
        aiOrValidation: 'Toast; queue count −1',
        api: { method: 'PUT', path: '/flha/:id' },
      },
    ],
    roleVariations: [
      {
        role: 'HSE',
        variation: 'Full review + create focus/actions',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'SUPERVISOR',
        variation: 'Review own crew FLHAs; limited dismiss',
        canWrite: true,
      },
      { role: 'PM', variation: 'Read + escalate to HSE' },
      {
        role: 'WORKER',
        variation: 'View own FLHA only; no review queue',
        canWrite: false,
      },
    ],
    dodChecks: ['Flags audited + queue decrement'],
  },
  {
    id: 'erp-simulation',
    name: 'Running an ERP simulation',
    entry:
      '/pm/emergency-response → Generate ERP → Simulate / Run drill / Find in emergency',
    route: '/pm/emergency-response',
    intelligencePage: 'emergency',
    rolesSummary: 'HSE, PM, Supervisors (drill conductors)',
    aiTriggers: [
      SMS_BEHAVIORS.ERP_DRAFT,
      SMS_BEHAVIORS.ERP_SIM,
      SMS_BEHAVIORS.MEETING_TOPICS,
    ],
    success:
      'Simulation outcomeScore shown OR drill closed with accountability complete / escalated missing list',
    errors: [
      { code: 'UPSTREAM_ERROR', ux: '502 EMS → 911-only' },
      { code: 'BUSINESS_RULE', ux: 'empty roster blocks drill · incomplete ERP' },
      {
        code: 'VALIDATION_ERROR',
        ux: 'never invent phones',
      },
    ],
    steps: [
      {
        id: '1',
        userAction:
          'Sets work type, hazards, region, scenario; Generate ERP',
        systemResponse: 'POST /erp/generate → draft preview',
        aiOrValidation: 'AI-06; EMS from includeEmsIds only',
        api: { method: 'POST', path: '/erp/generate' },
        aiTriggers: [SMS_BEHAVIORS.ERP_DRAFT],
      },
      {
        id: '2',
        userAction: 'Selects EMS checkboxes; reviews script',
        systemResponse: 'Script injects selected contacts',
        aiOrValidation: 'Validate phones from provider',
        api: { method: 'GET', path: '/ems' },
      },
      {
        id: '3',
        userAction: 'Persists ERP (optional)',
        systemResponse: 'POST /erp',
        aiOrValidation: 'suggestionId audited',
        api: { method: 'POST', path: '/erp' },
      },
      {
        id: '4',
        userAction: 'Clicks Simulate',
        systemResponse: 'POST /erp/{id}/simulate',
        aiOrValidation: 'AI-07 timeline (no real dispatch)',
        api: { method: 'POST', path: '/erp/:id/simulate' },
        aiTriggers: [SMS_BEHAVIORS.ERP_SIM],
      },
      {
        id: '5',
        userAction: 'Reviews pass/fail gates',
        systemResponse: 'failedGates + coaching',
        aiOrValidation: 'Optional L1 debrief',
      },
      {
        id: '6',
        userAction: 'Done',
        systemResponse: 'outcomeScore panel; CTA schedule drill / meeting',
        aiOrValidation: 'AI-14 topic offer',
        aiTriggers: [SMS_BEHAVIORS.MEETING_TOPICS],
      },
    ],
    branches: [
      {
        id: 'erp-drill',
        name: 'Live ERP drill',
        steps: [
          {
            id: 'd1',
            userAction: 'Run ERP drill',
            systemResponse: 'POST /erp/{id}/drills; roster from gate/toolbox/FLHA',
            aiOrValidation: 'Require ≥1 sign-in source',
            api: { method: 'POST', path: '/erp/:id/drills' },
          },
          {
            id: 'd2',
            userAction: 'Mark Accounted / Missing / Excused',
            systemResponse: 'PUT roster status; KPIs live',
            aiOrValidation: 'Completeness %',
            api: {
              method: 'PUT',
              path: '/erp/drills/:drillId/roster/:personId',
            },
          },
          {
            id: 'd3',
            userAction: 'Close drill',
            systemResponse: 'Session closed; readiness refresh',
            aiOrValidation: 'Policy: block if missing unacked',
          },
        ],
      },
      {
        id: 'find-emergency',
        name: 'Find in emergency',
        steps: [
          {
            id: 'f1',
            userAction: 'Find in emergency',
            systemResponse: 'GET /ems; emergency panel top of page',
            aiOrValidation: 'No LLM phones',
            api: { method: 'GET', path: '/ems' },
          },
          {
            id: 'f2',
            userAction: 'Tap 911 / agency tel:',
            systemResponse: 'OS dialer',
            aiOrValidation: 'Audit if linked to ERP',
          },
        ],
      },
    ],
    roleVariations: [
      {
        role: 'HSE',
        variation: 'Generate, persist, simulate, run drills',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'PM',
        variation: 'Generate, persist, simulate, run drills',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'SUPERVISOR',
        variation: 'Simulate + conduct drill; limited generate if policy',
        canWrite: true,
      },
      {
        role: 'WORKER',
        variation: 'Find in emergency + dial only',
        canWrite: false,
      },
      { role: 'AUDITOR', variation: 'Read ERP/drill history' },
    ],
    dodChecks: [
      'outcomeScore + no real 911 fired',
      'Completeness % + roster statuses persisted',
    ],
  },
  {
    id: 'complete-inspection',
    name: 'Completing an inspection',
    entry: '/pm/inspections → New · focus pack · Field',
    route: '/pm/inspections',
    intelligencePage: 'inspections',
    rolesSummary: 'Inspectors, Supervisors, HSE',
    aiTriggers: [
      SMS_BEHAVIORS.INSPECTION_FOCUS,
      SMS_BEHAVIORS.INSPECTION_QUALITY,
      SMS_BEHAVIORS.ACTION_CORRECTIVE,
    ],
    success:
      'Inspection complete; quality score; findings → action CTAs; trends update',
    errors: [
      { code: 'VALIDATION_ERROR', ux: '400 incomplete checklist' },
      { code: 'UPSTREAM_ERROR', ux: 'photo upload retry' },
      { code: 'BUSINESS_RULE', ux: '422' },
    ],
    steps: [
      {
        id: '1',
        userAction: 'Starts BBO / focus / standard',
        systemResponse: 'Optional focus pack prefill',
        aiOrValidation: 'AI-08 if generating pack',
        aiTriggers: [SMS_BEHAVIORS.INSPECTION_FOCUS],
        api: { method: 'POST', path: '/inspections/focus-packs' },
      },
      {
        id: '2',
        userAction: 'Records observations, findings, photos',
        systemResponse: 'Autosave draft',
        aiOrValidation: 'Client required checks',
      },
      {
        id: '3',
        userAction: 'Submits',
        systemResponse: 'POST /inspections',
        aiOrValidation: 'Checklist completion % gate',
        api: { method: 'POST', path: '/inspections' },
        validation: ['projectId', 'type'],
      },
      {
        id: '4',
        userAction: 'Quality score runs',
        systemResponse: 'POST …/score',
        aiOrValidation: 'AI-09',
        api: { method: 'POST', path: '/inspections/:id/score' },
        aiTriggers: [SMS_BEHAVIORS.INSPECTION_QUALITY],
      },
      {
        id: '5',
        userAction: 'Creates corrective/preventive from finding (optional)',
        systemResponse: 'POST /actions source=inspection',
        aiOrValidation: 'AI-12 suggest optional',
        api: { method: 'POST', path: '/actions' },
        aiTriggers: [SMS_BEHAVIORS.ACTION_CORRECTIVE],
      },
      {
        id: '6',
        userAction: 'Done',
        systemResponse: 'Toast; hub trends refresh',
        aiOrValidation: 'AI-17 inspection signal',
        aiTriggers: [SMS_BEHAVIORS.CROSS_PAGE],
        api: { method: 'GET', path: '/inspections/trends' },
      },
    ],
    roleVariations: [
      {
        role: 'INSPECTOR',
        variation: 'All types + score + actions',
        canWrite: true,
      },
      {
        role: 'HSE',
        variation: 'All types + score + actions',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'SUPERVISOR',
        variation: 'BBO / standard; focus if assigned',
        canWrite: true,
      },
      {
        role: 'WORKER',
        variation: 'Observation-only if invited',
        canWrite: false,
      },
      { role: 'AUDITOR', variation: 'Read trends + completed only' },
    ],
    dodChecks: ['Score + findings count + trends path'],
  },
  {
    id: 'close-action',
    name: 'Closing corrective / preventive actions',
    entry: '/pm/action-management → action detail · overdue queue',
    route: '/pm/action-management',
    intelligencePage: 'actions',
    rolesSummary: 'Owner completes; HSE verifies/closes (policy)',
    aiTriggers: [SMS_BEHAVIORS.MEETING_TOPICS, SMS_BEHAVIORS.CROSS_PAGE],
    success:
      'Status closed; effectiveness captured; aging KPIs update; optional lesson meeting',
    errors: [
      { code: 'BUSINESS_RULE', ux: '422 verification required' },
      { code: 'FORBIDDEN', ux: '403 not owner' },
      { code: 'CONFLICT', ux: '409 version' },
    ],
    steps: [
      {
        id: '1',
        userAction: 'Opens open/overdue action',
        systemResponse: 'GET detail + evidence checklist',
        aiOrValidation: 'Show SLA breach banner',
        api: { method: 'GET', path: '/actions/:id' },
      },
      {
        id: '2',
        userAction: 'Completes work; uploads evidence',
        systemResponse: 'PUT in_progress → pending_verify',
        aiOrValidation: 'Evidence required if policy',
        api: { method: 'PUT', path: '/actions/:id' },
        validation: ['rowVersion'],
      },
      {
        id: '3',
        userAction: 'Verifier reviews',
        systemResponse: 'PUT closed + effectivenessPct',
        aiOrValidation: 'HSE/owner role gate',
        api: { method: 'PUT', path: '/actions/:id' },
        validation: ['effectivenessPct'],
      },
      {
        id: '4',
        userAction: 'Optional: generate meeting topic',
        systemResponse: 'POST meetings/topics/generate',
        aiOrValidation: 'AI-14',
        api: { method: 'POST', path: '/meetings/topics/generate' },
        aiTriggers: [SMS_BEHAVIORS.MEETING_TOPICS],
      },
      {
        id: '5',
        userAction: 'Success',
        systemResponse: 'Removed from overdue; root-cause flow updates',
        aiOrValidation: 'Home insight refresh',
        aiTriggers: [SMS_BEHAVIORS.CROSS_PAGE],
        api: { method: 'GET', path: '/actions/metrics' },
      },
    ],
    roleVariations: [
      {
        role: 'OWNER',
        variation:
          'Move to pending_verify; cannot self-close if verify required',
        canWrite: true,
      },
      {
        role: 'HSE',
        variation: 'Verify + close + effectiveness; reassign',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'PM',
        variation: 'Close low/medium on project policy',
        canApprove: true,
      },
      {
        role: 'SUPERVISOR',
        variation: 'Own actions only',
        canWrite: true,
      },
      { role: 'AUDITOR', variation: 'Read + export' },
    ],
    dodChecks: ['closed + effectiveness + overdue −1'],
  },
  {
    id: 'schedule-meeting',
    name: 'Scheduling safety meetings',
    entry: '/pm/safety-meetings → Generate topics / Schedule',
    route: '/pm/safety-meetings',
    intelligencePage: 'meetings',
    rolesSummary: 'Supervisor+, HSE',
    aiTriggers: [SMS_BEHAVIORS.MEETING_TOPICS],
    success:
      'Meeting scheduled; topics linked; sign-in enabled; optional ERP drill brief type',
    errors: [
      { code: 'VALIDATION_ERROR', ux: '400 · past scheduledAt rejected' },
      { code: 'BUSINESS_RULE', ux: 'duplicate topic soft-warn' },
      { code: 'FORBIDDEN', ux: '403' },
    ],
    steps: [
      {
        id: '1',
        userAction: 'Generate topics',
        systemResponse: 'POST /meetings/topics/generate',
        aiOrValidation: 'AI-14 ranked list + confidence',
        api: { method: 'POST', path: '/meetings/topics/generate' },
        aiTriggers: [SMS_BEHAVIORS.MEETING_TOPICS],
      },
      {
        id: '2',
        userAction: 'Selects topics; Schedule',
        systemResponse: 'Form prefilled; suggestionIds tracked',
        aiOrValidation: 'Human accept',
        api: { method: 'POST', path: '/intelligence/accept' },
      },
      {
        id: '3',
        userAction: 'Sets time, location, type',
        systemResponse: 'Client: future scheduledAt',
        aiOrValidation: 'Type toolbox|orientation|emergency_drill_brief',
        validation: ['scheduledAt', 'meetingType'],
      },
      {
        id: '4',
        userAction: 'Submits',
        systemResponse: 'POST /meetings → 201',
        aiOrValidation: 'Idempotency',
        api: { method: 'POST', path: '/meetings' },
        validation: ['projectId', 'title', 'meetingType', 'scheduledAt'],
      },
      {
        id: '5',
        userAction: 'Day-of: attendees sign in',
        systemResponse: 'POST …/attendees/sign-in',
        aiOrValidation: 'Feeds ERP drill roster',
        api: { method: 'POST', path: '/meetings/:id/attendees/sign-in' },
      },
      {
        id: '6',
        userAction: 'Complete meeting',
        systemResponse: 'PUT status=completed; attendancePct',
        aiOrValidation: 'Hub KPIs refresh',
        api: { method: 'PUT', path: '/meetings/:id' },
      },
    ],
    roleVariations: [
      {
        role: 'HSE',
        variation: 'Generate + schedule any project meeting',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'PM',
        variation: 'Generate + schedule any project meeting',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'SUPERVISOR',
        variation: 'Toolbox + sign-in; limited company-wide',
        canWrite: true,
      },
      { role: 'WORKER', variation: 'Sign-in only', canWrite: false },
      { role: 'AUDITOR', variation: 'Read attendance history' },
    ],
    dodChecks: ['scheduled + topics + sign-in ready'],
  },
  {
    id: 'view-dashboards',
    name: 'Viewing dashboards',
    entry: '/pm home · module hubs · VeriCore competency · regional',
    route: '/pm',
    intelligencePage: 'home',
    rolesSummary: 'Per module read ACL; Worker limited KPIs',
    aiTriggers: [
      SMS_BEHAVIORS.HOME,
      SMS_BEHAVIORS.COMPETENCY,
      SMS_BEHAVIORS.BENCHMARK,
      SMS_BEHAVIORS.REGIONAL,
      SMS_BEHAVIORS.CROSS_PAGE,
    ],
    success:
      'KPIs + insights rendered; plane switch refetches; stale banner if cache/lag',
    errors: [
      { code: 'SERVICE_UNAVAILABLE', ux: '503 metrics lag banner' },
      { code: 'FORBIDDEN', ux: '403 plane' },
      {
        code: 'UPSTREAM_ERROR',
        ux: 'never empty insights (fallback)',
      },
    ],
    steps: [
      {
        id: '1',
        userAction: 'Lands on hub (e.g. /pm)',
        systemResponse: 'GET /dashboard/home + /intelligence?page=home',
        aiOrValidation: 'AI-01 + AI-17',
        api: { method: 'GET', path: '/dashboard/home' },
        aiTriggers: [SMS_BEHAVIORS.HOME, SMS_BEHAVIORS.CROSS_PAGE],
      },
      {
        id: '2',
        userAction: 'Switches plane (if entitled)',
        systemResponse: 'Refetch with X-Vera-Plane',
        aiOrValidation: 'RBAC re-check',
      },
      {
        id: '3',
        userAction: 'Opens regional node (if entitled)',
        systemResponse: 'GET regions/tree + metrics + insights',
        aiOrValidation: 'AI-18',
        api: { method: 'GET', path: '/regions/tree' },
        aiTriggers: [SMS_BEHAVIORS.REGIONAL],
      },
      {
        id: '4',
        userAction: 'Views industry compare',
        systemResponse: 'GET /benchmarks/industry',
        aiOrValidation: 'AI-16; suppress n<5',
        api: { method: 'GET', path: '/benchmarks/industry' },
        aiTriggers: [SMS_BEHAVIORS.BENCHMARK],
      },
      {
        id: '5',
        userAction: 'Opens competency hub',
        systemResponse: 'GET /competency/metrics',
        aiOrValidation: 'AI-15 risk index',
        api: { method: 'GET', path: '/competency/metrics' },
        aiTriggers: [SMS_BEHAVIORS.COMPETENCY],
      },
      {
        id: '6',
        userAction: 'Clicks KPI / insight chip',
        systemResponse: 'Deep link via Global/Module nav',
        aiOrValidation: 'No back-link pattern',
      },
    ],
    roleVariations: [
      {
        role: 'COMPANY_ADMIN',
        variation: 'Company plane + all projects + benchmarks + regional',
        canWrite: true,
        canApprove: true,
      },
      {
        role: 'HSE',
        variation: 'Assigned projects; limited company rollup',
        canWrite: true,
      },
      {
        role: 'PM',
        variation: 'Assigned projects; limited company rollup',
        canWrite: true,
      },
      {
        role: 'SUPERVISOR',
        variation: 'Project KPIs; no peer project drill',
      },
      {
        role: 'WORKER',
        variation: 'Personal/crew subset; no industry benchmark',
        canWrite: false,
      },
      {
        role: 'SUBCONTRACTOR_ADMIN',
        variation: 'Own sub metrics only',
        canWrite: true,
      },
      { role: 'AUDITOR', variation: 'Read-only all entitled planes' },
    ],
    dodChecks: ['KPIs + ≥1 insight/fallback + plane label'],
  },
  {
    id: 'cross-page-intelligence',
    name: 'Navigating cross-page intelligence links',
    entry: 'AiInsightPanel / InsightStrip / nextActions on any hub',
    route: '/pm',
    intelligencePage: 'home',
    rolesSummary: 'Any authenticated hub user (scoped suggestions)',
    aiTriggers: [SMS_BEHAVIORS.CROSS_PAGE, SMS_BEHAVIORS.HOME],
    success:
      'User lands on target module page with context prefilled; suggestion accepted/dismissed audited; no orphan tabs',
    errors: [
      { code: 'NOT_FOUND', ux: '404 stale suggestion' },
      { code: 'FORBIDDEN', ux: '403 target write' },
      { code: 'CONFLICT', ux: '409 already resolved' },
      {
        code: 'NOT_FOUND',
        ux: 'deep link missing entity → empty+CTA',
      },
    ],
    steps: [
      {
        id: '1',
        userAction: 'Views intelligence panel on page',
        systemResponse: 'GET /intelligence?page=…',
        aiOrValidation: 'AI-17 merge/rank; cache hit possible',
        api: { method: 'GET', path: '/intelligence' },
        aiTriggers: [SMS_BEHAVIORS.CROSS_PAGE],
      },
      {
        id: '2',
        userAction: 'Clicks suggestion / next action',
        systemResponse: 'Navigate via ModuleNav/GlobalNav href',
        aiOrValidation: 'Preserve plane query/header',
      },
      {
        id: '3',
        userAction: 'Target page opens with context',
        systemResponse:
          'Prefill from query (incidentId, focusPackId, scenario…)',
        aiOrValidation: 'Validate entity still in tenant',
      },
      {
        id: '4',
        userAction: 'Accepts CTA (create meeting/action/ERP…)',
        systemResponse: 'POST /intelligence/accept then domain POST',
        aiOrValidation: 'suggestionId required; audit',
        api: { method: 'POST', path: '/intelligence/accept' },
      },
      {
        id: '5',
        userAction: 'Or Dismisses',
        systemResponse: 'POST accept action=dismiss / dismiss',
        aiOrValidation: 'Removed from panel; logged',
        api: { method: 'POST', path: '/intelligence/dismiss' },
      },
      {
        id: '6',
        userAction: 'Return path',
        systemResponse: 'User uses Module dropdown / GlobalNav',
        aiOrValidation: 'Never inline “← back”',
      },
    ],
    roleVariations: [
      {
        role: 'ANY_READER',
        variation: 'Can open deep links within read ACL',
      },
      {
        role: 'WORKER',
        variation: 'Fewer suggestions; no industry/peer actions',
        canWrite: false,
      },
      {
        role: 'AUDITOR',
        variation: 'See suggestion but Accept disabled → Dismiss only',
        canWrite: false,
      },
    ],
    dodChecks: ['Land with context + accept/dismiss audit'],
  },
];

export const SMS_INTERACTION_FLOW_IDS = SMS_INTERACTION_FLOWS.map((f) => f.id);

export function getSmsInteractionFlow(
  id: string,
): SmsInteractionFlow | undefined {
  return SMS_INTERACTION_FLOWS.find((f) => f.id === id);
}

export function listSmsInteractionFlows(): Array<{
  id: string;
  name: string;
  route: string;
  intelligencePage: string;
  stepCount: number;
  aiTriggers: string[];
}> {
  return SMS_INTERACTION_FLOWS.map((f) => ({
    id: f.id,
    name: f.name,
    route: f.route,
    intelligencePage: f.intelligencePage,
    stepCount: f.steps.length,
    aiTriggers: f.aiTriggers,
  }));
}

export function roleCanWriteOnFlow(
  flowId: string,
  role: SmsFlowRole,
): boolean {
  const flow = getSmsInteractionFlow(flowId);
  if (!flow) return false;
  const match = flow.roleVariations.find((r) => r.role === role);
  if (!match) {
    // Default: HSE/PM/SUPERVISOR/COMPANY_ADMIN write; worker/auditor often false
    return ['HSE', 'PM', 'SUPERVISOR', 'COMPANY_ADMIN', 'INSPECTOR'].includes(
      role,
    );
  }
  return match.canWrite !== false;
}

export function flowsForIntelligencePage(page: string): SmsInteractionFlow[] {
  return SMS_INTERACTION_FLOWS.filter((f) => f.intelligencePage === page);
}

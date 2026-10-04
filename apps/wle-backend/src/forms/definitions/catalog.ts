import type { SafetyFormDefinitionJson } from '../engine/form-engine.types';
import { buildForm, HAZARD_FIELDS } from './catalog.helpers';

export const SAFETY_FORM_CATALOG: SafetyFormDefinitionJson[] = [
  buildForm(
    'jha',
    'Job Hazard Analysis (JHA)',
    'core',
    [
      {
        id: 'jobTitle',
        type: 'text',
        label: 'Job / task title',
        required: true,
      },
      {
        id: 'taskSteps',
        type: 'table',
        label: 'Job steps',
        required: true,
        columns: [
          { id: 'step', type: 'text', label: 'Step' },
          { id: 'hazard', type: 'text', label: 'Hazard' },
          { id: 'control', type: 'text', label: 'Control' },
        ],
      },
      ...HAZARD_FIELDS,
      {
        id: 'sifPotential',
        type: 'boolean',
        label: 'SIF potential identified',
      },
    ],
    { autoFlagSIF: true, autoGenerateCorrectiveActions: true },
  ),

  buildForm(
    'flha',
    'Field Level Hazard Assessment (FLHA)',
    'core',
    [
      {
        id: 'taskDescription',
        type: 'textarea',
        label: 'Work planned today',
        required: true,
      },
      {
        id: 'conditionsChanged',
        type: 'boolean',
        label: 'Site conditions changed since last assessment',
      },
      ...HAZARD_FIELDS,
      {
        id: 'controlsAdequate',
        type: 'select',
        label: 'Controls adequate?',
        required: true,
        options: ['yes', 'no', 'partial'],
      },
    ],
    { autoFlagSIF: true },
  ),

  buildForm(
    'sif',
    'SIF Assessment',
    'core',
    [
      {
        id: 'activity',
        type: 'textarea',
        label: 'Activity / task',
        required: true,
      },
      {
        id: 'sifPotential',
        type: 'boolean',
        label: 'SIF potential',
        required: true,
      },
      {
        id: 'severity',
        type: 'select',
        label: 'Severity',
        required: true,
        options: ['low', 'medium', 'high', 'SIF'],
      },
      {
        id: 'precursors',
        type: 'checklist',
        label: 'SIF precursors present',
        options: [
          'Line of fire',
          'Fall exposure',
          'Struck-by',
          'Caught-between',
          'Energy release',
        ],
      },
      {
        id: 'criticalControls',
        type: 'textarea',
        label: 'Critical controls required',
        required: true,
      },
      ...HAZARD_FIELDS.filter((f) => f.id !== 'riskRating'),
      {
        id: 'riskRating',
        type: 'risk',
        label: 'Residual risk',
        required: true,
      },
    ],
    { autoFlagSIF: true, autoGenerateCorrectiveActions: true },
  ),

  buildForm(
    'heca',
    'HECA Observation',
    'core',
    [
      {
        id: 'observationType',
        type: 'select',
        label: 'Observation type',
        required: true,
        options: ['HECA', 'safe', 'at_risk'],
      },
      {
        id: 'hecaCategory',
        type: 'select',
        label: 'HECA category',
        required: true,
        options: [
          'Eyes on task',
          'Line of fire',
          'Balance/fall',
          'Body position',
          'Tools/equipment',
          'Procedures',
        ],
      },
      {
        id: 'behaviorObserved',
        type: 'textarea',
        label: 'Behavior / condition observed',
        required: true,
      },
      {
        id: 'coachingProvided',
        type: 'textarea',
        label: 'Coaching / feedback',
      },
    ],
    { autoFlagHECA: true },
  ),

  buildForm(
    'energy-wheel',
    'Energy Wheel Analysis',
    'core',
    [
      {
        id: 'taskDescription',
        type: 'textarea',
        label: 'Task description',
        required: true,
      },
      {
        id: 'energyTypes',
        type: 'energy',
        label: 'Energy sources present',
        required: true,
      },
      {
        id: 'isolationRequired',
        type: 'boolean',
        label: 'Isolation / lockout required',
      },
      {
        id: 'controls',
        type: 'textarea',
        label: 'Energy control measures',
        required: true,
      },
      {
        id: 'zeroEnergyVerified',
        type: 'boolean',
        label: 'Zero energy verified',
      },
    ],
    { autoFlagSIF: true },
  ),

  buildForm(
    'inspection',
    'Safety Inspection',
    'inspections',
    [
      {
        id: 'inspectionArea',
        type: 'text',
        label: 'Area inspected',
        required: true,
      },
      {
        id: 'inspectionType',
        type: 'select',
        label: 'Inspection type',
        required: true,
        options: [
          'site',
          'equipment',
          'scaffold',
          'fall_protection',
          'housekeeping',
          'other',
        ],
      },
      { id: 'findings', type: 'textarea', label: 'Findings' },
      {
        id: 'complianceRating',
        type: 'select',
        label: 'Overall rating',
        required: true,
        options: ['compliant', 'minor_issues', 'major_issues', 'stop_work'],
      },
      ...HAZARD_FIELDS,
    ],
    { autoGenerateCorrectiveActions: true },
  ),

  buildForm(
    'pha',
    'Project Hazard Assessment',
    'core',
    [
      {
        id: 'projectScope',
        type: 'textarea',
        label: 'Project scope',
        required: true,
      },
      ...HAZARD_FIELDS.map((f) =>
        f.id === 'energyTypes' ? { ...f, required: true } : f,
      ),
      {
        id: 'residualRisk',
        type: 'risk',
        label: 'Residual risk after controls',
      },
      {
        id: 'sifPotential',
        type: 'boolean',
        label: 'SIF potential identified',
      },
    ],
    { autoFlagSIF: true, autoGenerateCorrectiveActions: true },
  ),

  buildForm(
    'daily-flha',
    'Daily FLHA',
    'core',
    [
      {
        id: 'taskDescription',
        type: 'textarea',
        label: 'Tasks for today',
        required: true,
      },
      ...HAZARD_FIELDS,
      {
        id: 'controlsAdequate',
        type: 'select',
        label: 'Controls adequate?',
        required: true,
        options: ['yes', 'no', 'partial'],
      },
    ],
    { autoFlagSIF: true },
  ),

  buildForm('site-orientation', 'Site Orientation Completion', 'core', [
    {
      id: 'orientationTopics',
      type: 'checklist',
      label: 'Topics covered',
      required: true,
      options: [
        'Emergency exits',
        'Muster point',
        'PPE requirements',
        'Site hazards',
        'Reporting process',
      ],
    },
    { id: 'orientedBy', type: 'worker', label: 'Oriented by' },
    {
      id: 'orientationComplete',
      type: 'boolean',
      label: 'Orientation complete',
      required: true,
    },
  ]),

  buildForm('training-verification', 'Training Verification', 'core', [
    {
      id: 'trainingCourse',
      type: 'text',
      label: 'Training course',
      required: true,
    },
    {
      id: 'trainingDate',
      type: 'date',
      label: 'Training date',
      required: true,
    },
    { id: 'certificateNumber', type: 'text', label: 'Certificate number' },
    { id: 'expiryDate', type: 'date', label: 'Expiry date' },
    {
      id: 'verified',
      type: 'boolean',
      label: 'Training verified',
      required: true,
    },
  ]),

  buildForm('competency-evaluation', 'Competency Evaluation', 'core', [
    {
      id: 'equipmentId',
      type: 'equipment',
      label: 'Equipment / task',
      required: true,
    },
    {
      id: 'competencyArea',
      type: 'text',
      label: 'Competency area',
      required: true,
    },
    {
      id: 'evaluationResult',
      type: 'select',
      label: 'Result',
      required: true,
      options: ['competent', 'not_competent', 'supervised_only'],
    },
    { id: 'evaluatorNotes', type: 'textarea', label: 'Evaluator notes' },
  ]),

  buildForm('fit-testing', 'Fit Testing', 'core', [
    {
      id: 'respiratorType',
      type: 'select',
      label: 'Respirator type',
      required: true,
      options: ['N95', 'Half-face', 'Full-face', 'PAPR', 'SCBA'],
    },
    {
      id: 'testMethod',
      type: 'select',
      label: 'Test method',
      required: true,
      options: ['Qualitative', 'Quantitative'],
    },
    {
      id: 'passFail',
      type: 'select',
      label: 'Result',
      required: true,
      options: ['pass', 'fail'],
    },
    { id: 'nextTestDue', type: 'date', label: 'Next test due' },
  ]),

  buildForm(
    'pre-use-inspection',
    'Pre-Use Equipment Inspection',
    'equipment',
    [
      {
        id: 'equipmentId',
        type: 'equipment',
        label: 'Equipment',
        required: true,
      },
      {
        id: 'inspectionChecklist',
        type: 'checklist',
        label: 'Pre-use checklist',
        required: true,
        options: [
          'Guards in place',
          'Fluids OK',
          'Controls functional',
          'Tires/tracks OK',
          'No leaks',
          'Safety devices OK',
        ],
      },
      { id: 'defectsFound', type: 'textarea', label: 'Defects found' },
      {
        id: 'fitForUse',
        type: 'select',
        label: 'Fit for use',
        required: true,
        options: ['yes', 'no', 'conditional'],
      },
    ],
    { autoGenerateCorrectiveActions: true },
  ),

  buildForm('equipment-return', 'Equipment Return', 'equipment', [
    {
      id: 'equipmentId',
      type: 'equipment',
      label: 'Equipment',
      required: true,
    },
    {
      id: 'returnCondition',
      type: 'select',
      label: 'Condition',
      required: true,
      options: ['good', 'fair', 'damaged', 'needs_service'],
    },
    { id: 'hoursMeter', type: 'number', label: 'Hours meter reading' },
    { id: 'returnNotes', type: 'textarea', label: 'Return notes' },
  ]),

  buildForm(
    'general-inspection',
    'General Safety Inspection',
    'inspections',
    [
      {
        id: 'inspectionArea',
        type: 'text',
        label: 'Area inspected',
        required: true,
      },
      { id: 'findings', type: 'textarea', label: 'Findings' },
      {
        id: 'complianceRating',
        type: 'select',
        label: 'Overall rating',
        required: true,
        options: ['compliant', 'minor_issues', 'major_issues', 'stop_work'],
      },
      ...HAZARD_FIELDS,
    ],
    { autoGenerateCorrectiveActions: true },
  ),

  buildForm(
    'corrective-action',
    'Corrective Action',
    'inspections',
    [
      {
        id: 'findingDescription',
        type: 'textarea',
        label: 'Finding / non-conformance',
        required: true,
      },
      { id: 'rootCause', type: 'textarea', label: 'Root cause' },
      {
        id: 'correctiveAction',
        type: 'textarea',
        label: 'Corrective action',
        required: true,
      },
      { id: 'dueDate', type: 'date', label: 'Due date', required: true },
      { id: 'assignedTo', type: 'worker', label: 'Assigned to' },
    ],
    { autoGenerateCorrectiveActions: true },
  ),

  buildForm(
    'heca-observation',
    'HECA Observation',
    'inspections',
    [
      {
        id: 'observationType',
        type: 'select',
        label: 'Observation type',
        required: true,
        options: ['HECA', 'safe', 'at_risk'],
      },
      {
        id: 'hecaCategory',
        type: 'select',
        label: 'HECA category',
        options: [
          'Eyes on task',
          'Line of fire',
          'Balance/fall',
          'Body position',
          'Tools/equipment',
          'Procedures',
        ],
      },
      { id: 'atRisk', type: 'boolean', label: 'At-risk behavior observed' },
      {
        id: 'coachingProvided',
        type: 'textarea',
        label: 'Coaching / feedback',
      },
    ],
    { autoFlagHECA: true },
  ),

  buildForm('bbo', 'Behavior-Based Observation', 'inspections', [
    {
      id: 'behaviorCategory',
      type: 'select',
      label: 'Behaviour category',
      required: true,
      options: [
        'body_position',
        'ppe',
        'tools_equipment',
        'procedures',
        'housekeeping',
        'line_of_fire',
        'other',
      ],
    },
    {
      id: 'workActivity',
      type: 'text',
      label: 'Work activity observed',
    },
    {
      id: 'behaviorObserved',
      type: 'textarea',
      label: 'Behavior observed (summary)',
      required: true,
    },
    {
      id: 'safeOrAtRisk',
      type: 'select',
      label: 'Classification',
      required: true,
      options: ['safe', 'at_risk'],
    },
    {
      id: 'antecedents',
      type: 'textarea',
      label: 'Antecedents (what triggered at-risk behaviour)',
    },
    {
      id: 'immediateAction',
      type: 'textarea',
      label: 'Immediate feedback / coaching',
    },
    {
      id: 'actionAgreed',
      type: 'textarea',
      label: 'One action agreed',
    },
  ]),

  buildForm(
    'incident-report',
    'Incident Report',
    'incidents',
    [
      {
        id: 'incidentType',
        type: 'select',
        label: 'Incident type',
        required: true,
        options: [
          'injury',
          'property_damage',
          'environmental',
          'security',
          'other',
        ],
      },
      {
        id: 'severity',
        type: 'select',
        label: 'Severity',
        required: true,
        options: ['low', 'medium', 'high', 'SIF'],
      },
      {
        id: 'description',
        type: 'textarea',
        label: 'Description',
        required: true,
      },
      { id: 'injuries', type: 'textarea', label: 'Injuries / damage' },
      { id: 'sifPotential', type: 'boolean', label: 'SIF potential' },
      ...HAZARD_FIELDS,
    ],
    { autoFlagSIF: true, autoGenerateCorrectiveActions: true },
  ),

  buildForm(
    'near-miss',
    'Near Miss',
    'incidents',
    [
      {
        id: 'description',
        type: 'textarea',
        label: 'What almost happened',
        required: true,
      },
      {
        id: 'potentialSeverity',
        type: 'select',
        label: 'Potential severity',
        required: true,
        options: ['low', 'medium', 'high', 'SIF'],
      },
      {
        id: 'preventiveActions',
        type: 'textarea',
        label: 'Preventive actions',
      },
      { id: 'sifPotential', type: 'boolean', label: 'Could have been SIF' },
    ],
    { autoFlagSIF: true },
  ),

  buildForm('emergency-response', 'Emergency Response', 'incidents', [
    {
      id: 'emergencyType',
      type: 'select',
      label: 'Emergency type',
      required: true,
      options: ['medical', 'fire', 'spill', 'evacuation', 'rescue', 'other'],
    },
    {
      id: 'responseActions',
      type: 'textarea',
      label: 'Response actions',
      required: true,
    },
    { id: 'allClear', type: 'boolean', label: 'All clear declared' },
    { id: 'injuriesReported', type: 'boolean', label: 'Injuries reported' },
  ]),

  buildForm('worker-site-access', 'Worker Site Access', 'permits', [
    {
      id: 'accessReason',
      type: 'text',
      label: 'Reason for access',
      required: true,
    },
    {
      id: 'orientationVerified',
      type: 'boolean',
      label: 'Site orientation verified',
      required: true,
    },
    {
      id: 'trainingVerified',
      type: 'boolean',
      label: 'Training verified',
      required: true,
    },
    {
      id: 'accessGranted',
      type: 'boolean',
      label: 'Access granted',
      required: true,
    },
  ]),

  buildForm(
    'confined-space',
    'Confined Space Entry Permit',
    'permits',
    [
      {
        id: 'spaceId',
        type: 'text',
        label: 'Confined space ID',
        required: true,
      },
      {
        id: 'entryPurpose',
        type: 'textarea',
        label: 'Purpose of entry',
        required: true,
      },
      {
        id: 'atmosphericTests',
        type: 'checklist',
        label: 'Atmospheric testing complete',
        options: ['O2', 'LEL', 'H2S', 'CO', 'Continuous monitor'],
      },
      {
        id: 'rescuePlan',
        type: 'textarea',
        label: 'Rescue plan',
        required: true,
      },
      {
        id: 'entrantCount',
        type: 'number',
        label: 'Number of entrants',
        validation: { min: 1 },
      },
    ],
    { requiresSupervisor: true },
  ),

  buildForm(
    'hot-work',
    'Hot Work Permit',
    'permits',
    [
      {
        id: 'workDescription',
        type: 'textarea',
        label: 'Hot work description',
        required: true,
      },
      {
        id: 'fireWatchAssigned',
        type: 'boolean',
        label: 'Fire watch assigned',
        required: true,
      },
      {
        id: 'combustiblesRemoved',
        type: 'boolean',
        label: 'Combustibles removed / protected',
        required: true,
      },
      {
        id: 'permitValidFrom',
        type: 'date',
        label: 'Valid from',
        required: true,
      },
      { id: 'permitValidTo', type: 'date', label: 'Valid to', required: true },
    ],
    { requiresSupervisor: true },
  ),

  buildForm(
    'lockout-tagout',
    'Lockout/Tagout Permit',
    'permits',
    [
      {
        id: 'equipmentId',
        type: 'equipment',
        label: 'Equipment',
        required: true,
      },
      {
        id: 'isolationPoints',
        type: 'checklist',
        label: 'Isolation points verified',
        required: true,
        options: [
          'Electrical',
          'Hydraulic',
          'Pneumatic',
          'Mechanical',
          'Stored energy released',
        ],
      },
      {
        id: 'lockCount',
        type: 'number',
        label: 'Number of locks applied',
        required: true,
      },
      {
        id: 'zeroEnergyVerified',
        type: 'boolean',
        label: 'Zero energy verified',
        required: true,
      },
    ],
    { requiresSupervisor: true },
  ),

  buildForm('leading-indicator', 'Leading Indicator', 'intelligence', [
    {
      id: 'indicatorType',
      type: 'select',
      label: 'Indicator type',
      required: true,
      options: [
        'inspections',
        'observations',
        'training_hours',
        'toolbox_talks',
        'hazards_identified',
      ],
    },
    { id: 'count', type: 'number', label: 'Count / value', required: true },
    {
      id: 'period',
      type: 'select',
      label: 'Period',
      options: ['daily', 'weekly', 'monthly'],
    },
    { id: 'notes', type: 'textarea', label: 'Notes' },
  ]),

  buildForm('lagging-indicator', 'Lagging Indicator', 'intelligence', [
    {
      id: 'indicatorType',
      type: 'select',
      label: 'Indicator type',
      required: true,
      options: [
        'trir',
        'ltir',
        'recordable',
        'first_aid',
        'property_damage',
        'near_miss',
      ],
    },
    { id: 'count', type: 'number', label: 'Count / rate', required: true },
    {
      id: 'period',
      type: 'select',
      label: 'Period',
      options: ['monthly', 'quarterly', 'ytd'],
    },
  ]),

  buildForm('toolbox-talk', 'Toolbox Talk', 'intelligence', [
    { id: 'topic', type: 'text', label: 'Topic', required: true },
    { id: 'attendeeCount', type: 'number', label: 'Attendees', required: true },
    { id: 'discussionNotes', type: 'textarea', label: 'Discussion notes' },
    { id: 'questionsRaised', type: 'textarea', label: 'Questions / concerns' },
  ]),

  buildForm(
    'crane-lift-plan',
    'Crane Lift Plan',
    'advanced',
    [
      {
        id: 'liftDescription',
        type: 'textarea',
        label: 'Lift description',
        required: true,
      },
      {
        id: 'loadWeight',
        type: 'number',
        label: 'Load weight (kg)',
        required: true,
      },
      {
        id: 'craneCapacity',
        type: 'number',
        label: 'Crane capacity (kg)',
        required: true,
      },
      {
        id: 'liftRadius',
        type: 'number',
        label: 'Lift radius (m)',
        required: true,
      },
      {
        id: 'riggingPlan',
        type: 'textarea',
        label: 'Rigging plan',
        required: true,
      },
      { id: 'groundConditions', type: 'text', label: 'Ground conditions' },
      { id: 'windSpeed', type: 'number', label: 'Wind speed (km/h)' },
    ],
    { requiresSupervisor: true },
  ),

  buildForm(
    'pme-check',
    'PME Check',
    'advanced',
    [
      {
        id: 'pmeType',
        type: 'select',
        label: 'PME type',
        required: true,
        options: [
          'scaffold',
          'ladder',
          'fall_protection',
          'barricade',
          'other',
        ],
      },
      {
        id: 'inspectionResult',
        type: 'select',
        label: 'Result',
        required: true,
        options: ['pass', 'fail', 'tagged_out'],
      },
      { id: 'tagNumber', type: 'text', label: 'Tag number' },
      { id: 'deficiencies', type: 'textarea', label: 'Deficiencies' },
    ],
    { autoGenerateCorrectiveActions: true },
  ),

  buildForm('trailer-unloading', 'Trailer Unloading Safety', 'advanced', [
    {
      id: 'trailerNumber',
      type: 'text',
      label: 'Trailer / BOL number',
      required: true,
    },
    {
      id: 'dockAreaClear',
      type: 'boolean',
      label: 'Dock area clear',
      required: true,
    },
    {
      id: 'wheelChocks',
      type: 'boolean',
      label: 'Wheel chocks in place',
      required: true,
    },
    {
      id: 'loadSecurement',
      type: 'boolean',
      label: 'Load securement verified',
      required: true,
    },
    {
      id: 'unloadingMethod',
      type: 'select',
      label: 'Unloading method',
      options: ['forklift', 'pallet_jack', 'manual'],
    },
    ...HAZARD_FIELDS,
  ]),
];

export const SAFETY_FORM_CATEGORIES = [
  'core',
  'equipment',
  'inspections',
  'incidents',
  'permits',
  'intelligence',
  'advanced',
] as const;

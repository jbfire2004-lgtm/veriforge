"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EQUIPMENT_SMART_AI_SYSTEM_PROMPT = exports.EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT = exports.EQUIPMENT_TRADITIONAL_CHECKLIST_JSON_SCHEMA = exports.EQUIPMENT_INSPECTION_PHOTO_JSON_SCHEMA = exports.EQUIPMENT_WORKFLOW_RULES = exports.EQUIPMENT_REPORT_OUTPUTS = exports.EQUIPMENT_SUPERVISOR_AUDIT_STEPS = exports.EQUIPMENT_VISION_ANALYSES = exports.SMART_AI_PHOTO_SECTIONS = exports.EQUIPMENT_WALKAROUND_SECTIONS = exports.TRADITIONAL_CHECKLIST_SECTIONS = exports.EQUIPMENT_MODE_OPTIONS = void 0;
exports.resolveEquipmentInspectionMode = resolveEquipmentInspectionMode;
exports.modeRequiresPhotos = modeRequiresPhotos;
exports.modeAnalyzesImages = modeAnalyzesImages;
exports.sectionsForMode = sectionsForMode;
exports.buildEquipmentSectionUserPrompt = buildEquipmentSectionUserPrompt;
exports.buildTraditionalSectionPrompt = buildTraditionalSectionPrompt;
exports.isEquipmentInspectionSectionId = isEquipmentInspectionSectionId;
exports.isTraditionalChecklistSectionId = isTraditionalChecklistSectionId;
exports.isEquipmentFinalStatus = isEquipmentFinalStatus;
exports.EQUIPMENT_MODE_OPTIONS = [
    {
        id: 'traditional',
        option: 'A',
        label: 'Traditional Equipment Inspection',
        description: 'Perform a standard equipment inspection using manual checklist confirmations and operator observations.',
        analyzesImages: false,
    },
    {
        id: 'smart_ai',
        option: 'B',
        label: 'Smart AI-Driven Equipment Inspection',
        description: 'Perform an AI-supported inspection using mandatory photos, automated defect detection, severity scoring, and operator review.',
        analyzesImages: true,
    },
];
exports.TRADITIONAL_CHECKLIST_SECTIONS = [
    {
        id: 'general_condition',
        label: 'General Condition',
        photoRequired: false,
        operatorInstruction: 'Confirm the equipment has no visible leaks, missing decals, loose components, or structural damage.',
    },
    {
        id: 'tires_tracks',
        label: 'Tires / Tracks',
        photoRequired: false,
        operatorInstruction: 'Confirm tires or tracks have no cuts, bulges, abnormal wear, or tension issues.',
    },
    {
        id: 'hydraulics',
        label: 'Hydraulics',
        photoRequired: false,
        operatorInstruction: 'Confirm hoses, cylinders, and fittings show no seepage, cracks, or abrasion.',
    },
    {
        id: 'frame_welds',
        label: 'Frame & Welds',
        photoRequired: false,
        operatorInstruction: 'Confirm frame joints and welds show no cracks, rust penetration, or deformation.',
    },
    {
        id: 'attachments',
        label: 'Attachments',
        photoRequired: false,
        operatorInstruction: 'Confirm attachment pins, bushings, locking mechanisms, and cutting edges are secure and undamaged.',
    },
    {
        id: 'lights_signals',
        label: 'Lights & Signals',
        photoRequired: false,
        operatorInstruction: 'Confirm all lights, signals, and alarms are functional.',
    },
    {
        id: 'safety_devices',
        label: 'Safety Devices',
        photoRequired: false,
        operatorInstruction: 'Confirm mirrors, seat belts, backup alarms, guards, and decals are present and functional.',
    },
    {
        id: 'cab_interior',
        label: 'Cab Interior',
        photoRequired: false,
        operatorInstruction: 'Confirm cab visibility, seat belt condition, cleanliness, and fire extinguisher presence.',
    },
    {
        id: 'control_panel',
        label: 'Control Panel',
        photoRequired: false,
        operatorInstruction: 'Confirm no abnormal warning lights or error codes are present.',
    },
    {
        id: 'final_status',
        label: 'Final Status',
        photoRequired: false,
        operatorInstruction: 'Declare equipment Safe, Restricted, or Unsafe based on operator observations.',
    },
];
exports.EQUIPMENT_WALKAROUND_SECTIONS = [
    {
        id: 'front_view',
        label: 'Front View',
        photoRequired: true,
        operatorInstruction: 'Capture a clear photo of the equipment from the front.',
    },
    {
        id: 'rear_view',
        label: 'Rear View',
        photoRequired: true,
        operatorInstruction: 'Capture a clear photo of the rear of the equipment.',
    },
    {
        id: 'left_side',
        label: 'Left Side',
        photoRequired: true,
        operatorInstruction: 'Photograph the left side of the machine.',
    },
    {
        id: 'right_side',
        label: 'Right Side',
        photoRequired: true,
        operatorInstruction: 'Photograph the right side of the machine.',
    },
    {
        id: 'tires_tracks',
        label: 'Tires / Tracks',
        photoRequired: true,
        operatorInstruction: 'Capture each tire or track.',
    },
    {
        id: 'undercarriage',
        label: 'Undercarriage',
        photoRequired: true,
        operatorInstruction: 'Take a photo underneath the machine.',
    },
    {
        id: 'hydraulic_hoses',
        label: 'Hydraulic Hoses',
        photoRequired: true,
        operatorInstruction: 'Photograph hydraulic hoses and fittings.',
    },
    {
        id: 'hydraulic_cylinders',
        label: 'Hydraulic Cylinders',
        photoRequired: true,
        operatorInstruction: 'Capture each cylinder rod.',
    },
    {
        id: 'frame_welds',
        label: 'Frame & Welds',
        photoRequired: true,
        operatorInstruction: 'Photograph frame joints and welds.',
    },
    {
        id: 'attachments',
        label: 'Attachments',
        photoRequired: true,
        operatorInstruction: 'Capture the attachment.',
    },
    {
        id: 'lights_signals',
        label: 'Lights & Signals',
        photoRequired: true,
        operatorInstruction: 'Photograph all lights and signals.',
    },
    {
        id: 'safety_devices',
        label: 'Safety Devices',
        photoRequired: true,
        operatorInstruction: 'Capture mirrors, alarms, seat belts, guards, and decals.',
    },
    {
        id: 'cab_interior',
        label: 'Cab Interior',
        photoRequired: true,
        operatorInstruction: 'Photograph the cab interior.',
    },
    {
        id: 'control_panel',
        label: 'Control Panel',
        photoRequired: true,
        operatorInstruction: 'Capture the control panel.',
    },
];
exports.SMART_AI_PHOTO_SECTIONS = exports.EQUIPMENT_WALKAROUND_SECTIONS;
exports.EQUIPMENT_VISION_ANALYSES = [
    {
        id: 'leak_detection',
        label: 'Leak Detection',
        instruction: 'Analyze for hydraulic, fuel, or coolant leaks. Classify severity based on spread, color, and location.',
    },
    {
        id: 'crack_detection',
        label: 'Crack Detection',
        instruction: 'Analyze for cracks in welds, frames, or attachments. Score severity based on length, depth, and structural impact.',
    },
    {
        id: 'guard_missing',
        label: 'Guard Missing',
        instruction: 'Identify missing or damaged guards. Determine if exposure creates an immediate hazard.',
    },
    {
        id: 'tire_track_damage',
        label: 'Tire / Track Damage',
        instruction: 'Detect cuts, bulges, sidewall damage, missing tread blocks, or track misalignment.',
    },
    {
        id: 'light_failure',
        label: 'Light Failure',
        instruction: 'Identify broken, missing, or non-functional lights.',
    },
    {
        id: 'severity_mapping',
        label: 'Severity Mapping',
        instruction: 'Map defect type and confidence score to Critical, Major, or Minor severity.',
    },
    {
        id: 'action_recommendation',
        label: 'Action Recommendation',
        instruction: 'Recommend lockout, repair scheduling, or monitoring based on severity.',
    },
];
exports.EQUIPMENT_SUPERVISOR_AUDIT_STEPS = [
    {
        id: 'defect_review',
        label: 'Defect Review',
        instruction: 'Review operator-confirmed defects. Approve, downgrade, upgrade, or dismiss.',
    },
    {
        id: 'work_order_approval',
        label: 'Work Order Approval',
        instruction: 'Approve or merge work orders. Confirm priority and due date.',
    },
    {
        id: 'inspection_audit',
        label: 'Inspection Audit',
        instruction: 'Verify inspection completeness, photo coverage, operator notes, and defect accuracy.',
    },
    {
        id: 'asset_history_check',
        label: 'Asset History Check',
        instruction: 'Review past defects and repairs to identify recurring issues.',
    },
];
exports.EQUIPMENT_REPORT_OUTPUTS = [
    {
        id: 'inspection_summary',
        label: 'Inspection Summary',
        instruction: 'Generate a summary including operator notes, AI findings (if applicable), defects, and overall status.',
    },
    {
        id: 'defect_report',
        label: 'Defect Report',
        instruction: 'Create defect-specific reports including photos, severity, and recommended actions.',
    },
    {
        id: 'maintenance_link',
        label: 'Maintenance Link',
        instruction: 'Attach work orders and maintenance history to the inspection record.',
    },
];
exports.EQUIPMENT_WORKFLOW_RULES = [
    {
        id: 'mode_selection',
        label: 'Mode Selection',
        rule: 'Present Traditional vs Smart AI options at inspection start; branch all logic on selected mode.',
        modes: ['traditional', 'smart_ai'],
    },
    {
        id: 'photo_requirement',
        label: 'Photo Requirement',
        rule: 'Require mandatory photos before allowing section completion (AI mode only).',
        modes: ['smart_ai'],
    },
    {
        id: 'no_image_analysis_traditional',
        label: 'No Image Analysis (Traditional)',
        rule: 'Traditional mode uses manual prompts only; do not analyze images.',
        modes: ['traditional'],
    },
    {
        id: 'operator_override',
        label: 'Operator Override',
        rule: 'Allow operator to override AI findings with justification (AI mode).',
        modes: ['smart_ai'],
    },
    {
        id: 'completion_gate',
        label: 'Completion Gate',
        rule: 'Block inspection completion until all sections are complete and defects reviewed.',
        modes: ['traditional', 'smart_ai'],
    },
];
exports.EQUIPMENT_INSPECTION_PHOTO_JSON_SCHEMA = `{
  "mode": "smart_ai",
  "sectionId": "front_view|rear_view|left_side|right_side|tires_tracks|undercarriage|hydraulic_hoses|hydraulic_cylinders|frame_welds|attachments|lights_signals|safety_devices|cab_interior|control_panel|unknown",
  "overallStatus": "pass|fail|attention",
  "defects": [
    {
      "defectType": "leak|crack|guard_missing|tire_track_damage|light_failure|structural_damage|loose_component|wear|missing_decal|warning_indicator|other",
      "title": "short title",
      "description": "detail",
      "severity": "critical|major|minor",
      "confidence": 0.0-1.0,
      "recommendedAction": "lockout|repair_schedule|monitor|none",
      "justification": "severity rationale",
      "workOrderHint": "short maintenance action or null"
    }
  ],
  "operatorNotesSuggested": "optional",
  "summary": "one paragraph equipment condition summary"
}`;
exports.EQUIPMENT_TRADITIONAL_CHECKLIST_JSON_SCHEMA = `{
  "mode": "traditional",
  "sectionId": "general_condition|tires_tracks|hydraulics|frame_welds|attachments|lights_signals|safety_devices|cab_interior|control_panel|final_status",
  "result": "pass|fail|na|pending",
  "observations": "operator observation summary",
  "defects": [
    {
      "defectType": "leak|crack|guard_missing|tire_track_damage|light_failure|structural_damage|loose_component|wear|missing_decal|warning_indicator|other",
      "title": "short title",
      "description": "detail",
      "severity": "critical|major|minor",
      "recommendedAction": "lockout|repair_schedule|monitor|none",
      "workOrderHint": "short maintenance action or null"
    }
  ],
  "finalStatus": "safe|restricted|unsafe|null",
  "summary": "one paragraph equipment condition summary"
}`;
exports.EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT = [
    'SYSTEM ROLE: You are the Equipment Inspection Engine for VeriForge.',
    'You support two inspection modes:',
    '1. Traditional Equipment Inspection (manual checklist, operator-driven) — no image analysis.',
    '2. Smart AI-Driven Equipment Inspection (photo-based, AI-assisted defect detection).',
    'You NEVER perform Smart Safety Inspections (site hazards, PPE compliance walkdowns, FLHA, or general jobsite safety).',
    'You ONLY handle equipment walk-arounds, defect detection, audit workflows, and inspection reporting.',
    '',
    'MODE SELECTION: When an inspection begins, present Traditional (A) vs Smart AI (B). Branch all workflow logic on mode = traditional | smart_ai.',
    'MODE A (traditional): Use manual checklist prompts only. Do NOT analyze images. Final status is Safe, Restricted, or Unsafe.',
    'MODE B (smart_ai): Require mandatory photos; run multi-label defect detection; include confidence and recommendedAction.',
    '',
    'AI VISION ANALYSIS (smart_ai only):',
    ...exports.EQUIPMENT_VISION_ANALYSES.map((a) => `- ${a.label}: ${a.instruction}`),
    '',
    'SEVERITY: critical = lockout / immediate stop; major = repair schedule; minor = monitor / next PM.',
    'OUTPUT RULES:',
    '1. Always return structured, consistent JSON outputs.',
    '2. Always include defect type, severity, confidence, and recommended action in smart_ai mode.',
    '3. Always link defects to work orders (workOrderHint for critical/major).',
    '4. Never perform Smart Safety Inspections or invent PPE/jobsite findings.',
    '5. Never skip mandatory photo validations in smart_ai mode.',
    '6. Never invent defects, asset IDs, work order IDs, serials, or operator identities.',
    '7. Always maintain audit-ready formatting.',
    '',
    `Smart AI photo schema:\n${exports.EQUIPMENT_INSPECTION_PHOTO_JSON_SCHEMA}`,
].join('\n');
exports.EQUIPMENT_SMART_AI_SYSTEM_PROMPT = exports.EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT;
function resolveEquipmentInspectionMode(raw) {
    const key = (raw !== null && raw !== void 0 ? raw : '').trim().toLowerCase();
    if (!key)
        return null;
    if (key === 'traditional' ||
        key === 'manual' ||
        key === 'standard' ||
        key === 'mode_a' ||
        key === 'a') {
        return 'traditional';
    }
    if (key === 'smart_ai' ||
        key === 'smart' ||
        key === 'ai' ||
        key === 'photo' ||
        key === 'mode_b' ||
        key === 'b') {
        return 'smart_ai';
    }
    return null;
}
function modeRequiresPhotos(mode) {
    return mode === 'smart_ai';
}
function modeAnalyzesImages(mode) {
    return mode === 'smart_ai';
}
function sectionsForMode(mode) {
    return mode === 'traditional'
        ? exports.TRADITIONAL_CHECKLIST_SECTIONS
        : exports.EQUIPMENT_WALKAROUND_SECTIONS;
}
function buildEquipmentSectionUserPrompt(sectionId, extras) {
    const section = exports.EQUIPMENT_WALKAROUND_SECTIONS.find((s) => s.id === sectionId);
    const lines = [
        'MODE: smart_ai',
        'Analyze this equipment walk-around photo for equipment defects only.',
        section
            ? `Section: ${section.label}\nOperator instruction: ${section.operatorInstruction}`
            : 'Section: unknown — infer closest walk-around section if possible.',
        (extras === null || extras === void 0 ? void 0 : extras.assetType) ? `Asset type: ${extras.assetType}` : null,
        (extras === null || extras === void 0 ? void 0 : extras.assetId)
            ? `Asset ID (do not invent if absent): ${extras.assetId}`
            : null,
        (extras === null || extras === void 0 ? void 0 : extras.caption) ? `Operator caption: ${extras.caption}` : null,
        (extras === null || extras === void 0 ? void 0 : extras.operatorNotes) ? `Operator notes: ${extras.operatorNotes}` : null,
    ].filter(Boolean);
    return lines.join('\n\n');
}
function buildTraditionalSectionPrompt(sectionId, extras) {
    const section = exports.TRADITIONAL_CHECKLIST_SECTIONS.find((s) => s.id === sectionId);
    const lines = [
        'MODE: traditional',
        'Assist with this traditional equipment checklist section. Do NOT analyze images.',
        section
            ? `Section: ${section.label}\nOperator instruction: ${section.operatorInstruction}`
            : 'Section: unknown.',
        (extras === null || extras === void 0 ? void 0 : extras.assetType) ? `Asset type: ${extras.assetType}` : null,
        (extras === null || extras === void 0 ? void 0 : extras.assetId)
            ? `Asset ID (do not invent if absent): ${extras.assetId}`
            : null,
        (extras === null || extras === void 0 ? void 0 : extras.observations) ? `Operator observations: ${extras.observations}` : null,
        (extras === null || extras === void 0 ? void 0 : extras.operatorNotes) ? `Operator notes: ${extras.operatorNotes}` : null,
        `Return JSON matching:\n${exports.EQUIPMENT_TRADITIONAL_CHECKLIST_JSON_SCHEMA}`,
    ].filter(Boolean);
    return lines.join('\n\n');
}
function isEquipmentInspectionSectionId(value) {
    if (!value)
        return false;
    return exports.EQUIPMENT_WALKAROUND_SECTIONS.some((s) => s.id === value);
}
function isTraditionalChecklistSectionId(value) {
    if (!value)
        return false;
    return exports.TRADITIONAL_CHECKLIST_SECTIONS.some((s) => s.id === value);
}
function isEquipmentFinalStatus(value) {
    return value === 'safe' || value === 'restricted' || value === 'unsafe';
}
//# sourceMappingURL=equipment-inspection-engine.js.map
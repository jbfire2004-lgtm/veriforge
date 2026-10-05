export type EquipmentInspectionMode = 'traditional' | 'smart_ai';
export type EquipmentFinalStatus = 'safe' | 'restricted' | 'unsafe';
export type EquipmentInspectionSectionId = 'front_view' | 'rear_view' | 'left_side' | 'right_side' | 'tires_tracks' | 'undercarriage' | 'hydraulic_hoses' | 'hydraulic_cylinders' | 'frame_welds' | 'attachments' | 'lights_signals' | 'safety_devices' | 'cab_interior' | 'control_panel';
export type TraditionalChecklistSectionId = 'general_condition' | 'tires_tracks' | 'hydraulics' | 'frame_welds' | 'attachments' | 'lights_signals' | 'safety_devices' | 'cab_interior' | 'control_panel' | 'final_status';
export type EquipmentDefectType = 'leak' | 'crack' | 'guard_missing' | 'tire_track_damage' | 'light_failure' | 'structural_damage' | 'loose_component' | 'wear' | 'missing_decal' | 'warning_indicator' | 'other';
export type EquipmentDefectSeverity = 'critical' | 'major' | 'minor';
export type EquipmentRecommendedAction = 'lockout' | 'repair_schedule' | 'monitor' | 'none';
export type TraditionalChecklistSection = {
    id: TraditionalChecklistSectionId;
    label: string;
    photoRequired: false;
    operatorInstruction: string;
};
export type SmartAiPhotoSection = {
    id: EquipmentInspectionSectionId;
    label: string;
    photoRequired: true;
    operatorInstruction: string;
};
export declare const EQUIPMENT_MODE_OPTIONS: readonly [{
    readonly id: "traditional";
    readonly option: "A";
    readonly label: "Traditional Equipment Inspection";
    readonly description: "Perform a standard equipment inspection using manual checklist confirmations and operator observations.";
    readonly analyzesImages: false;
}, {
    readonly id: "smart_ai";
    readonly option: "B";
    readonly label: "Smart AI-Driven Equipment Inspection";
    readonly description: "Perform an AI-supported inspection using mandatory photos, automated defect detection, severity scoring, and operator review.";
    readonly analyzesImages: true;
}];
export declare const TRADITIONAL_CHECKLIST_SECTIONS: readonly TraditionalChecklistSection[];
export declare const EQUIPMENT_WALKAROUND_SECTIONS: readonly SmartAiPhotoSection[];
export declare const SMART_AI_PHOTO_SECTIONS: readonly SmartAiPhotoSection[];
export declare const EQUIPMENT_VISION_ANALYSES: readonly [{
    readonly id: "leak_detection";
    readonly label: "Leak Detection";
    readonly instruction: "Analyze for hydraulic, fuel, or coolant leaks. Classify severity based on spread, color, and location.";
}, {
    readonly id: "crack_detection";
    readonly label: "Crack Detection";
    readonly instruction: "Analyze for cracks in welds, frames, or attachments. Score severity based on length, depth, and structural impact.";
}, {
    readonly id: "guard_missing";
    readonly label: "Guard Missing";
    readonly instruction: "Identify missing or damaged guards. Determine if exposure creates an immediate hazard.";
}, {
    readonly id: "tire_track_damage";
    readonly label: "Tire / Track Damage";
    readonly instruction: "Detect cuts, bulges, sidewall damage, missing tread blocks, or track misalignment.";
}, {
    readonly id: "light_failure";
    readonly label: "Light Failure";
    readonly instruction: "Identify broken, missing, or non-functional lights.";
}, {
    readonly id: "severity_mapping";
    readonly label: "Severity Mapping";
    readonly instruction: "Map defect type and confidence score to Critical, Major, or Minor severity.";
}, {
    readonly id: "action_recommendation";
    readonly label: "Action Recommendation";
    readonly instruction: "Recommend lockout, repair scheduling, or monitoring based on severity.";
}];
export declare const EQUIPMENT_SUPERVISOR_AUDIT_STEPS: readonly [{
    readonly id: "defect_review";
    readonly label: "Defect Review";
    readonly instruction: "Review operator-confirmed defects. Approve, downgrade, upgrade, or dismiss.";
}, {
    readonly id: "work_order_approval";
    readonly label: "Work Order Approval";
    readonly instruction: "Approve or merge work orders. Confirm priority and due date.";
}, {
    readonly id: "inspection_audit";
    readonly label: "Inspection Audit";
    readonly instruction: "Verify inspection completeness, photo coverage, operator notes, and defect accuracy.";
}, {
    readonly id: "asset_history_check";
    readonly label: "Asset History Check";
    readonly instruction: "Review past defects and repairs to identify recurring issues.";
}];
export declare const EQUIPMENT_REPORT_OUTPUTS: readonly [{
    readonly id: "inspection_summary";
    readonly label: "Inspection Summary";
    readonly instruction: "Generate a summary including operator notes, AI findings (if applicable), defects, and overall status.";
}, {
    readonly id: "defect_report";
    readonly label: "Defect Report";
    readonly instruction: "Create defect-specific reports including photos, severity, and recommended actions.";
}, {
    readonly id: "maintenance_link";
    readonly label: "Maintenance Link";
    readonly instruction: "Attach work orders and maintenance history to the inspection record.";
}];
export declare const EQUIPMENT_WORKFLOW_RULES: readonly [{
    readonly id: "mode_selection";
    readonly label: "Mode Selection";
    readonly rule: "Present Traditional vs Smart AI options at inspection start; branch all logic on selected mode.";
    readonly modes: readonly ["traditional", "smart_ai"];
}, {
    readonly id: "photo_requirement";
    readonly label: "Photo Requirement";
    readonly rule: "Require mandatory photos before allowing section completion (AI mode only).";
    readonly modes: readonly ["smart_ai"];
}, {
    readonly id: "no_image_analysis_traditional";
    readonly label: "No Image Analysis (Traditional)";
    readonly rule: "Traditional mode uses manual prompts only; do not analyze images.";
    readonly modes: readonly ["traditional"];
}, {
    readonly id: "operator_override";
    readonly label: "Operator Override";
    readonly rule: "Allow operator to override AI findings with justification (AI mode).";
    readonly modes: readonly ["smart_ai"];
}, {
    readonly id: "completion_gate";
    readonly label: "Completion Gate";
    readonly rule: "Block inspection completion until all sections are complete and defects reviewed.";
    readonly modes: readonly ["traditional", "smart_ai"];
}];
export declare const EQUIPMENT_INSPECTION_PHOTO_JSON_SCHEMA = "{\n  \"mode\": \"smart_ai\",\n  \"sectionId\": \"front_view|rear_view|left_side|right_side|tires_tracks|undercarriage|hydraulic_hoses|hydraulic_cylinders|frame_welds|attachments|lights_signals|safety_devices|cab_interior|control_panel|unknown\",\n  \"overallStatus\": \"pass|fail|attention\",\n  \"defects\": [\n    {\n      \"defectType\": \"leak|crack|guard_missing|tire_track_damage|light_failure|structural_damage|loose_component|wear|missing_decal|warning_indicator|other\",\n      \"title\": \"short title\",\n      \"description\": \"detail\",\n      \"severity\": \"critical|major|minor\",\n      \"confidence\": 0.0-1.0,\n      \"recommendedAction\": \"lockout|repair_schedule|monitor|none\",\n      \"justification\": \"severity rationale\",\n      \"workOrderHint\": \"short maintenance action or null\"\n    }\n  ],\n  \"operatorNotesSuggested\": \"optional\",\n  \"summary\": \"one paragraph equipment condition summary\"\n}";
export declare const EQUIPMENT_TRADITIONAL_CHECKLIST_JSON_SCHEMA = "{\n  \"mode\": \"traditional\",\n  \"sectionId\": \"general_condition|tires_tracks|hydraulics|frame_welds|attachments|lights_signals|safety_devices|cab_interior|control_panel|final_status\",\n  \"result\": \"pass|fail|na|pending\",\n  \"observations\": \"operator observation summary\",\n  \"defects\": [\n    {\n      \"defectType\": \"leak|crack|guard_missing|tire_track_damage|light_failure|structural_damage|loose_component|wear|missing_decal|warning_indicator|other\",\n      \"title\": \"short title\",\n      \"description\": \"detail\",\n      \"severity\": \"critical|major|minor\",\n      \"recommendedAction\": \"lockout|repair_schedule|monitor|none\",\n      \"workOrderHint\": \"short maintenance action or null\"\n    }\n  ],\n  \"finalStatus\": \"safe|restricted|unsafe|null\",\n  \"summary\": \"one paragraph equipment condition summary\"\n}";
export declare const EQUIPMENT_INSPECTION_ENGINE_SYSTEM_PROMPT: string;
export declare const EQUIPMENT_SMART_AI_SYSTEM_PROMPT: string;
export declare function resolveEquipmentInspectionMode(raw: string | undefined | null): EquipmentInspectionMode | null;
export declare function modeRequiresPhotos(mode: EquipmentInspectionMode): boolean;
export declare function modeAnalyzesImages(mode: EquipmentInspectionMode): boolean;
export declare function sectionsForMode(mode: EquipmentInspectionMode): readonly TraditionalChecklistSection[] | readonly SmartAiPhotoSection[];
export declare function buildEquipmentSectionUserPrompt(sectionId: EquipmentInspectionSectionId | undefined, extras?: {
    caption?: string;
    operatorNotes?: string;
    assetId?: string;
    assetType?: string;
}): string;
export declare function buildTraditionalSectionPrompt(sectionId: TraditionalChecklistSectionId | undefined, extras?: {
    operatorNotes?: string;
    assetId?: string;
    assetType?: string;
    observations?: string;
}): string;
export declare function isEquipmentInspectionSectionId(value: string | undefined | null): value is EquipmentInspectionSectionId;
export declare function isTraditionalChecklistSectionId(value: string | undefined | null): value is TraditionalChecklistSectionId;
export declare function isEquipmentFinalStatus(value: string | undefined | null): value is EquipmentFinalStatus;

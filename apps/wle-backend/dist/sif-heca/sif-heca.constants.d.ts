export declare const HECA_CATEGORIES: readonly [{
    readonly code: "eyes_on_task";
    readonly label: "Eyes on task";
    readonly keywords: readonly ["distraction", "attention", "eyes", "focus", "phone"];
    readonly energyTypes: readonly [];
}, {
    readonly code: "line_of_fire";
    readonly label: "Line of fire";
    readonly keywords: readonly ["struck", "swing", "drop", "line of fire", "overhead", "crane"];
    readonly energyTypes: readonly ["gravity", "mechanical"];
}, {
    readonly code: "balance_fall";
    readonly label: "Balance / fall";
    readonly keywords: readonly ["fall", "slip", "trip", "height", "ladder", "edge"];
    readonly energyTypes: readonly ["gravity"];
}, {
    readonly code: "body_position";
    readonly label: "Body position";
    readonly keywords: readonly ["ergonomic", "posture", "pinch", "strain", "awkward"];
    readonly energyTypes: readonly ["motion"];
}, {
    readonly code: "tools_equipment";
    readonly label: "Tools / equipment";
    readonly keywords: readonly ["tool", "equipment", "machine", "guard", "lockout"];
    readonly energyTypes: readonly ["mechanical", "electrical"];
}, {
    readonly code: "procedures";
    readonly label: "Procedures";
    readonly keywords: readonly ["procedure", "permit", "shortcut", "bypass", "rule"];
    readonly energyTypes: readonly [];
}];
export declare const SIF_INDICATORS: readonly [{
    readonly code: "FALL_HEIGHT";
    readonly label: "Fall from height";
    readonly weight: 25;
}, {
    readonly code: "STRUCK_BY";
    readonly label: "Struck-by moving object";
    readonly weight: 20;
}, {
    readonly code: "CAUGHT_IN";
    readonly label: "Caught in/between";
    readonly weight: 20;
}, {
    readonly code: "ELECTRICAL_CONTACT";
    readonly label: "Electrical contact";
    readonly weight: 25;
}, {
    readonly code: "CONFINED_SPACE";
    readonly label: "Confined space engulfment";
    readonly weight: 25;
}, {
    readonly code: "HEAVY_LIFT";
    readonly label: "Heavy lift / rigging";
    readonly weight: 15;
}, {
    readonly code: "VEHICLE_STRIKE";
    readonly label: "Vehicle / mobile equipment strike";
    readonly weight: 20;
}];
export declare const HIGH_ENERGY_TYPES: Set<string>;
export declare const SIF_ENERGY_WHEEL: readonly [{
    readonly type: "gravity";
    readonly label: "Gravity / falling";
    readonly highEnergy: true;
}, {
    readonly type: "mechanical";
    readonly label: "Mechanical / moving parts";
    readonly highEnergy: true;
}, {
    readonly type: "electrical";
    readonly label: "Electrical";
    readonly highEnergy: true;
}, {
    readonly type: "pressure";
    readonly label: "Pressure / pneumatic";
    readonly highEnergy: true;
}, {
    readonly type: "thermal";
    readonly label: "Thermal";
    readonly highEnergy: false;
}, {
    readonly type: "chemical";
    readonly label: "Chemical";
    readonly highEnergy: false;
}, {
    readonly type: "radiation";
    readonly label: "Radiation";
    readonly highEnergy: false;
}, {
    readonly type: "biological";
    readonly label: "Biological";
    readonly highEnergy: false;
}, {
    readonly type: "motion";
    readonly label: "Motion / ergonomics";
    readonly highEnergy: false;
}];
export declare function categoryFromScore(score: number): 'low' | 'medium' | 'high' | 'critical';

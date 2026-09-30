/** Hazard categories for multi-select (maps to assessment narrative + JSON payload). */
export const PM_HAZARD_OPTIONS = [
  { id: "FALLS", label: "Falls / elevated work" },
  { id: "STRUCK_BY", label: "Struck-by / caught-between" },
  { id: "ELECTRICAL", label: "Electrical / arc flash" },
  { id: "FIRE_EXPLOSION", label: "Fire / explosion / hot work" },
  { id: "CHEMICAL", label: "Chemical / dust / fumes" },
  { id: "ERGONOMIC", label: "Ergonomic / material handling" },
  { id: "ENVIRONMENTAL", label: "Environmental (noise, heat, weather)" },
  { id: "LINE_OF_FIRE", label: "Line-of-fire / stored energy" },
  { id: "MOBILE_EQUIP", label: "Mobile equipment / traffic" },
  { id: "OTHER", label: "Other (describe in narrative)" },
] as const;

/** Control categories — link to selected hazards in the saved narrative. */
export const PM_CONTROL_OPTIONS = [
  { id: "ELIMINATION", label: "Elimination / substitution" },
  { id: "ENGINEERING", label: "Engineering controls" },
  { id: "ADMIN", label: "Administrative (permits, sequencing)" },
  { id: "PPE", label: "PPE" },
  { id: "BARRIER", label: "Barriers / barricades" },
  { id: "LOTO", label: "Lockout / tagout / isolation" },
  { id: "VENTILATION", label: "Ventilation / monitoring" },
  { id: "COMPETENCY", label: "Competency / supervision / communication" },
  { id: "EMERGENCY", label: "Emergency response / rescue" },
  { id: "OTHER", label: "Other (describe in narrative)" },
] as const;

/** Energy isolation categories (Energy Wheel). */
export const PM_ENERGY_WHEEL_CATEGORIES = [
  { id: "ELECTRICAL", label: "Electrical" },
  { id: "PRESSURE_HYDRAULIC", label: "Pressure / hydraulic" },
  { id: "PNEUMATIC", label: "Pneumatic" },
  { id: "GRAVITATIONAL", label: "Gravitational / suspended load" },
  { id: "MECHANICAL_MOTION", label: "Mechanical motion" },
  { id: "CHEMICAL_THERMAL", label: "Chemical / thermal" },
] as const;

/** HECA — typical exposure routes. */
export const PM_HECA_EXPOSURE_ROUTES = [
  { id: "INHALATION", label: "Inhalation" },
  { id: "DERMAL", label: "Dermal / absorption" },
  { id: "INGESTION", label: "Ingestion" },
  { id: "EYE", label: "Eye / mucous membrane" },
] as const;

export type PmAssessmentFormKind =
  | "JHA"
  | "FLHA"
  | "SIF"
  | "HECA"
  | "ENERGY_WHEEL"
  | "INSPECTION";

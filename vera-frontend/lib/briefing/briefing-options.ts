/** Job types for daily safety briefings. */
export const BRIEFING_JOB_TYPES = [
  { value: "general-construction", label: "General construction" },
  { value: "civil-earthworks", label: "Civil / earthworks" },
  { value: "electrical", label: "Electrical" },
  { value: "mechanical", label: "Mechanical / piping" },
  { value: "confined-space", label: "Confined space entry" },
  { value: "hot-work", label: "Hot work / welding" },
  { value: "working-at-height", label: "Working at height" },
  { value: "crane-lifting", label: "Crane & lifting" },
  { value: "turnaround-shutdown", label: "Turnaround / shutdown" },
  { value: "pipeline", label: "Pipeline" },
] as const;

export const BRIEFING_HAZARDS = [
  "Struck-by / caught-between",
  "Falls from height",
  "Electrical contact",
  "Fire / explosion",
  "H2S / atmospheric",
  "Heat / cold stress",
  "Noise exposure",
  "Pinch points / line of fire",
  "Mobile equipment",
  "Excavation / ground disturbance",
  "Chemical exposure",
  "Lightning / severe weather",
  "Fatigue",
  "Simultaneous operations",
] as const;

export const BRIEFING_CONTROLS = [
  "Pre-job hazard assessment (FLHA)",
  "Toolbox talk / crew briefing",
  "Barricades & signage",
  "Fall protection / 100% tie-off",
  "Hot work permit",
  "Confined space permit",
  "Ground disturbance permit",
  "LOTO / zero energy",
  "Spotter for equipment",
  "Respiratory protection",
  "Hydration & shade breaks",
  "Gas monitoring",
  "Exclusion zones",
  "Competent supervision",
  "Emergency response plan review",
] as const;

/** Client mirror of backend PPE kit pre-use checklist. */

export type PpePreUseItemResult = "pass" | "fail" | "na";

export type PpePreUseChecklistItemDef = {
  id: string;
  category: string;
  label: string;
  critical?: boolean;
};

export const PPE_PREUSE_CHECKLIST: PpePreUseChecklistItemDef[] = [
  {
    id: "head_shell",
    category: "Head",
    label: "Hard hat shell free of cracks, dents, or UV damage",
    critical: true,
  },
  {
    id: "head_suspension",
    category: "Head",
    label: "Hard hat suspension / straps intact and adjusted",
    critical: true,
  },
  {
    id: "eye_condition",
    category: "Eye/face",
    label: "Safety glasses / goggles clear, undamaged, fit sealed",
    critical: true,
  },
  {
    id: "face_shield",
    category: "Eye/face",
    label: "Face shield (if required) clean and undamaged",
  },
  {
    id: "hearing_fit",
    category: "Hearing",
    label: "Hearing protection present, fit, and serviceable",
  },
  {
    id: "hands_condition",
    category: "Hands",
    label: "Gloves correct for task — no tears, holes, or contamination",
    critical: true,
  },
  {
    id: "feet_condition",
    category: "Feet",
    label: "Safety footwear sole, toe cap, and upper intact",
    critical: true,
  },
  {
    id: "hivis_condition",
    category: "Hi-vis",
    label: "High-visibility apparel clean with reflective integrity",
    critical: true,
  },
  {
    id: "rpe_present",
    category: "Respiratory",
    label: "RPE available if required; seal / filter / cartridge OK",
    critical: true,
  },
  {
    id: "fall_webbing",
    category: "Fall protection",
    label: "Harness / lanyard webbing free of cuts, fray, or chemical damage",
    critical: true,
  },
  {
    id: "fall_hardware",
    category: "Fall protection",
    label: "Fall protection hardware, labels, and stitching serviceable",
    critical: true,
  },
  {
    id: "other_task",
    category: "Other task PPE",
    label: "Any other task PPE (welding, chemical, etc.) inspected or N/A",
  },
];

export type PpePreUseItemSubmission = {
  id: string;
  result: PpePreUseItemResult;
  note?: string;
};

export function computePpePreUseOverall(
  items: PpePreUseItemSubmission[],
): "pass" | "fail" | "conditional" {
  const byId = new Map(items.map((i) => [i.id, i]));
  let anyFail = false;
  let criticalFail = false;
  for (const def of PPE_PREUSE_CHECKLIST) {
    const row = byId.get(def.id);
    if (!row || row.result === "na") continue;
    if (row.result === "fail") {
      anyFail = true;
      if (def.critical) criticalFail = true;
    }
  }
  if (criticalFail) return "fail";
  if (anyFail) return "conditional";
  return "pass";
}

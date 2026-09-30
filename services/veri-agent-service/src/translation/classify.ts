import type {
  HazardCategory,
  MitigationType,
  RiskLevel,
} from "./types";

export function inferEnergyType(text: string): string {
  const t = text.toLowerCase();
  if (/fall|height|scaffold|ladder|roof|elevation/.test(t)) return "gravitational";
  if (/electric|arc|voltage|loto|panel|conductor/.test(t)) return "electrical";
  if (/chem|spill|gas|fume|solvent|asbestos/.test(t)) return "chemical";
  if (/heat|hot|weld|fire|burn|thermal/.test(t)) return "thermal";
  if (/machine|pinch|guard|caught|crush/.test(t)) return "mechanical";
  if (/struck|vehicle|mobile|equipment swing/.test(t)) return "kinetic";
  return "unspecified";
}

export function inferHazardCategory(
  text: string,
  energyType?: string,
): HazardCategory {
  const energy = (energyType ?? "").toLowerCase();
  if (energy === "gravitational" || energy === "kinetic") {
    return energy === "gravitational" ? "fall" : "struck_by";
  }
  if (energy === "electrical") return "electrical";
  if (energy === "chemical") return "chemical";
  if (energy === "thermal") return "thermal";
  if (energy === "mechanical") return "mechanical";

  const t = `${text} ${energy}`.toLowerCase();
  if (/fall|height|scaffold|ladder|roof|excav|trench/.test(t)) return "fall";
  if (/electric|arc|voltage|loto/.test(t)) return "electrical";
  if (/chem|spill|gas|fume|solvent/.test(t)) return "chemical";
  if (/heat|hot|weld|fire|burn/.test(t)) return "thermal";
  if (/struck|vehicle|overhead load/.test(t)) return "struck_by";
  if (/caught|pinch|crush|entrap/.test(t)) return "caught_in";
  if (/lift|manual|ergonomic|repetitive/.test(t)) return "ergonomic";
  if (/weather|wind|ice|flood|environment/.test(t)) return "environmental";
  if (/machine|guard|mechanical/.test(t)) return "mechanical";
  return "other";
}

export function classifyMitigationType(control: string): MitigationType {
  const t = control.toLowerCase();
  if (/eliminat|remove hazard|do not use/.test(t)) return "elimination";
  if (/substitut|replace with|alternative material/.test(t)) return "substitution";
  if (/guard|barricade|interlock|ventilation|isolation|loto|engineering/.test(t))
    return "engineering";
  if (/procedure|permit|training|spotter|checklist|signage|admin/.test(t))
    return "administrative";
  if (/ppe|hard hat|harness|glove|respirator|glasses|vest|boots/.test(t))
    return "ppe";
  return "other";
}

export function normalizeRisk(risk?: string): RiskLevel {
  const r = (risk ?? "medium").toLowerCase();
  if (r === "low" || r === "medium" || r === "high" || r === "critical") {
    return r;
  }
  return "medium";
}

const TASK_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /excav|trench|dig/i, label: "excavation" },
  { re: /scaffold|erect.*frame/i, label: "scaffolding" },
  { re: /weld|hot work|cutting/i, label: "hot_work" },
  { re: /electrical|energiz|panel/i, label: "electrical_work" },
  { re: /lift|crane|hoist|rigging/i, label: "lifting_rigging" },
  { re: /confined|space entry/i, label: "confined_space" },
  { re: /demolition|demo /i, label: "demolition" },
  { re: /concrete|formwork|pour/i, label: "concrete_work" },
  { re: /roof|roofing/i, label: "roofing" },
  { re: /paint|coating/i, label: "coating" },
];

export function abstractTaskType(task: string): string {
  for (const p of TASK_PATTERNS) {
    if (p.re.test(task)) return p.label;
  }
  return "general_task";
}

export function normalizeEnvironment(
  value?: string,
): "indoor" | "outdoor" | "mixed" | "unspecified" {
  const v = (value ?? "").toLowerCase();
  if (v === "indoor" || v === "outdoor" || v === "mixed") return v;
  if (/indoor|inside|enclosed/.test(v)) return "indoor";
  if (/outdoor|outside|open air/.test(v)) return "outdoor";
  if (/mixed|both/.test(v)) return "mixed";
  return "unspecified";
}

export function abstractWorkType(input?: string): string {
  if (!input?.trim()) return "general_construction";
  const t = input.toLowerCase();
  if (/civil|earth|road/.test(t)) return "civil";
  if (/industrial|plant|refinery/.test(t)) return "industrial";
  if (/commercial|office|retail/.test(t)) return "commercial";
  if (/residential|housing/.test(t)) return "residential";
  if (/maintenance|turnaround|shutdown/.test(t)) return "maintenance";
  if (/infra|utility|pipeline/.test(t)) return "infrastructure";
  return "general_construction";
}

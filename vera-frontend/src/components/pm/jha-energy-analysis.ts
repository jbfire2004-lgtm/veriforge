export const JHA_ENERGY_TYPES = [
  { id: "electrical", label: "Electrical", color: "#eab308" },
  { id: "mechanical", label: "Mechanical", color: "#64748b" },
  { id: "gravity", label: "Gravity", color: "#8b5cf6" },
  { id: "motion", label: "Motion", color: "#2F85CC" },
  { id: "pressure", label: "Pressure", color: "#f97316" },
  { id: "chemical", label: "Chemical", color: "#3AA39F" },
  { id: "thermal", label: "Thermal", color: "#ef4444" },
  { id: "radiation", label: "Radiation", color: "#a855f7" },
  { id: "biological", label: "Biological", color: "#22c55e" },
] as const;

export type JhaEnergyId = (typeof JHA_ENERGY_TYPES)[number]["id"];

export type HazardEnergyInput = {
  id: string;
  description: string;
  energyTypes?: unknown;
};

export type ControlEnergyInput = {
  id: string;
  hazardId?: string | null;
  description: string;
  controlType: string;
};

export type EnergySegmentAnalysis = {
  id: JhaEnergyId;
  label: string;
  color: string;
  hazards: string[];
  controls: string[];
  hasGap: boolean;
  autoDetected: boolean;
};

export function energyLabel(id: string): string {
  return JHA_ENERGY_TYPES.find((e) => e.id === id)?.label ?? id;
}

export function analyzeJhaEnergies(
  hazards: HazardEnergyInput[],
  controls: ControlEnergyInput[],
  controlLibrary: Array<Record<string, unknown>>,
  selectedEnergy: string[],
): EnergySegmentAnalysis[] {
  const libByDesc = new Map<string, Record<string, unknown>>();
  for (const row of controlLibrary) {
    libByDesc.set(String(row.description), row);
  }

  const hazardById = new Map(hazards.map((h) => [h.id, h]));
  const bucket = new Map<string, { hazards: Set<string>; controls: Set<string> }>();

  function ensure(id: string) {
    if (!bucket.has(id)) bucket.set(id, { hazards: new Set(), controls: new Set() });
    return bucket.get(id)!;
  }

  for (const h of hazards) {
    const types = Array.isArray(h.energyTypes) ? (h.energyTypes as string[]) : [];
    for (const t of types) {
      ensure(t).hazards.add(h.description);
    }
  }

  for (const c of controls) {
    const lib = libByDesc.get(c.description);
    let types = Array.isArray(lib?.energyTypes) ? (lib!.energyTypes as string[]) : [];
    if (types.length === 0 && c.hazardId) {
      const linked = hazardById.get(c.hazardId);
      types = Array.isArray(linked?.energyTypes) ? (linked!.energyTypes as string[]) : [];
    }
    for (const t of types) {
      ensure(t).controls.add(c.description);
    }
  }

  const activeIds = new Set([
    ...bucket.keys(),
    ...selectedEnergy,
  ]);

  return JHA_ENERGY_TYPES.filter((e) => activeIds.has(e.id) || bucket.has(e.id)).map((e) => {
    const entry = bucket.get(e.id);
    const hazardList = entry ? Array.from(entry.hazards) : [];
    const controlList = entry ? Array.from(entry.controls) : [];
    const autoDetected = hazardList.length > 0 || controlList.length > 0;
    return {
      id: e.id,
      label: e.label,
      color: e.color,
      hazards: hazardList,
      controls: controlList,
      hasGap: hazardList.length > 0 && controlList.length === 0,
      autoDetected,
    };
  });
}

export function deriveEnergyTypes(
  hazards: HazardEnergyInput[],
  controls: ControlEnergyInput[],
  controlLibrary: Array<Record<string, unknown>>,
): string[] {
  const analysis = analyzeJhaEnergies(hazards, controls, controlLibrary, []);
  return analysis.filter((a) => a.autoDetected).map((a) => a.id);
}

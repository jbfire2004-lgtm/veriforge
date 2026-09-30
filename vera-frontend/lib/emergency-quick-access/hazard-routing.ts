/**
 * Client-side hazard contact routing for emergency quick-access.
 * Keep phones in sync with backend catalog (verified only).
 */

import { utilitiesForRegion, type VerifiedUtilityContact } from "./utility-contacts";

export type QuickHazardKind =
  | "gas_line_strike"
  | "electrical_strike"
  | "hazardous_release";

export type QuickRoutedContact = {
  id: string;
  hazard: QuickHazardKind;
  name: string;
  phone: string | null;
  reason: string;
  dialHint: string;
  priority: number;
};

const OHS_NAME: Record<string, string> = {
  "CA-SK": "Saskatchewan OHS",
  "CA-AB": "Alberta OHS",
  "CA-BC": "WorkSafeBC",
  "CA-MB": "Manitoba WSH",
  "CA-ON": "Ontario MOL / OHSA",
};

function pick(
  list: VerifiedUtilityContact[],
  id: string,
): VerifiedUtilityContact | undefined {
  return list.find((c) => c.id === id) ?? list[0];
}

export function routeQuickHazardContacts(input: {
  regionCode: string;
  scenario?: string;
  hazardsText?: string;
}): QuickRoutedContact[] {
  const region = input.regionCode;
  const utils = utilitiesForRegion(region);
  const text = `${input.scenario ?? ""} ${input.hazardsText ?? ""}`.toLowerCase();
  const kinds = new Set<QuickHazardKind>();

  if (/gas|saskenergy|pipeline|line strike/.test(text)) kinds.add("gas_line_strike");
  if (/electric|arc|power line|saskpower|atco/.test(text) || input.scenario === "electrical") {
    kinds.add("electrical_strike");
  }
  if (
    /hazardous|chemical|spill|hazmat|toxic|release/.test(text) ||
    input.scenario === "chemical"
  ) {
    kinds.add("hazardous_release");
  }

  // Default ERP quick pack always exposes primary gas + electric routes for the region
  if (kinds.size === 0) {
    kinds.add("gas_line_strike");
    kinds.add("electrical_strike");
    kinds.add("hazardous_release");
  }

  const out: QuickRoutedContact[] = [];
  for (const hazard of kinds) {
    if (hazard === "gas_line_strike") {
      const gas =
        pick(
          utils.filter((u) => u.role.toLowerCase().includes("gas")),
          region === "CA-SK" ? "util-sk-saskenergy" : "util-ab-atco-gas",
        ) ?? utils.find((u) => u.id.includes("gas") || u.id.includes("saskenergy") || u.id.includes("atco-gas") || u.id.includes("fortis") || u.id.includes("enbridge"));
      if (gas) {
        out.push({
          id: `q-gas-${gas.id}`,
          hazard,
          name: gas.name,
          phone: gas.phone,
          reason:
            region === "CA-SK"
              ? "Gas line strike → SaskEnergy emergency line"
              : `Gas line strike → ${gas.name}`,
          dialHint: `Dial ${gas.phone}`,
          priority: 1,
        });
      }
    }
    if (hazard === "electrical_strike") {
      const elecPreferred =
        region === "CA-SK"
          ? "util-sk-saskpower"
          : region === "CA-AB"
            ? "util-ab-atco-electric"
            : "util-bc-bchydro";
      const elec =
        utils.find((u) => u.id === elecPreferred) ??
        utils.find((u) => u.role.toLowerCase().includes("electric"));
      if (elec) {
        out.push({
          id: `q-elec-${elec.id}`,
          hazard,
          name: elec.name,
          phone: elec.phone,
          reason:
            region === "CA-SK"
              ? "Electrical strike → SaskPower emergency line"
              : region === "CA-AB"
                ? "Electrical strike → ATCO Electric emergency line"
                : `Electrical strike → ${elec.name}`,
          dialHint: `Dial ${elec.phone}`,
          priority: 1,
        });
      }
      if (region === "CA-SK") {
        const atco = utilitiesForRegion("CA-AB").find(
          (u) => u.id === "util-ab-atco-electric",
        );
        if (atco) {
          out.push({
            id: `q-elec-${atco.id}`,
            hazard,
            name: atco.name,
            phone: atco.phone,
            reason: "Electrical strike → ATCO Electric (Alberta)",
            dialHint: `Dial ${atco.phone}`,
            priority: 2,
          });
        }
      }
    }
    if (hazard === "hazardous_release") {
      out.push({
        id: `q-ohs-${region}`,
        hazard,
        name: OHS_NAME[region] ?? "Provincial OHS",
        phone: null,
        reason: "Hazardous release → Provincial OHS required reporting",
        dialHint: "Use ministry / WorkSafeBC reporting channels — not a dial invent",
        priority: 1,
      });
      out.push({
        id: "q-fire-911",
        hazard,
        name: "Local fire / HAZMAT",
        phone: "911",
        reason: "Hazardous release → local fire (via 911)",
        dialHint: "Dial 911 — request fire / HAZMAT",
        priority: 2,
      });
    }
  }
  return out.sort((a, b) => a.priority - b.priority || a.hazard.localeCompare(b.hazard));
}

/**
 * Verified utility emergency phones for quick-access — catalog only.
 * Keep in sync with backend erp-ohs-utility.catalog.ts.
 */

export type VerifiedUtilityContact = {
  id: string;
  region: string;
  name: string;
  phone: string;
  role: string;
  notes: string;
};

export const VERIFIED_UTILITY_CONTACTS: VerifiedUtilityContact[] = [
  {
    id: "util-sk-saskenergy",
    region: "CA-SK",
    name: "SaskEnergy Emergency",
    phone: "1-888-700-0421",
    role: "Gas utility",
    notes: "Gas line strike / odor / release",
  },
  {
    id: "util-sk-saskpower",
    region: "CA-SK",
    name: "SaskPower Emergency",
    phone: "310-2220",
    role: "Electric utility",
    notes: "Electrical infrastructure emergencies",
  },
  {
    id: "util-sk-sask911",
    region: "CA-SK",
    name: "Sask 1st Call",
    phone: "1-866-828-4888",
    role: "Locate / damage",
    notes: "Locate coordination; still call utility + 911 for releases",
  },
  {
    id: "util-ab-atco-gas",
    region: "CA-AB",
    name: "ATCO Gas Emergency",
    phone: "1-800-511-3447",
    role: "Gas utility",
    notes: "Alberta gas emergency",
  },
  {
    id: "util-ab-atco-electric",
    region: "CA-AB",
    name: "ATCO Electric Emergency",
    phone: "1-800-668-5506",
    role: "Electric utility",
    notes: "Alberta electrical strike / downed line emergencies",
  },
  {
    id: "util-ab-clickbeforeyoudig",
    region: "CA-AB",
    name: "Alberta One-Call",
    phone: "1-800-242-3447",
    role: "Locate / damage",
    notes: "Damage reporting coordination",
  },
  {
    id: "util-bc-fortis",
    region: "CA-BC",
    name: "FortisBC Gas Emergency",
    phone: "1-800-663-9911",
    role: "Gas utility",
    notes: "BC gas utility emergency",
  },
  {
    id: "util-bc-bchydro",
    region: "CA-BC",
    name: "BC Hydro Emergency",
    phone: "1-800-224-9376",
    role: "Electric utility",
    notes: "BC electrical emergencies",
  },
];

export function utilitiesForRegion(regionCode: string): VerifiedUtilityContact[] {
  const exact = VERIFIED_UTILITY_CONTACTS.filter((c) => c.region === regionCode);
  if (exact.length) return exact;
  // Soft match e.g. "Saskatchewan" → prefer SK when region string contains it
  const upper = regionCode.toUpperCase();
  if (upper.includes("SK") || upper.includes("SASK")) {
    return VERIFIED_UTILITY_CONTACTS.filter((c) => c.region === "CA-SK");
  }
  if (upper.includes("AB") || upper.includes("ALBERTA")) {
    return VERIFIED_UTILITY_CONTACTS.filter((c) => c.region === "CA-AB");
  }
  if (upper.includes("BC") || upper.includes("BRITISH")) {
    return VERIFIED_UTILITY_CONTACTS.filter((c) => c.region === "CA-BC");
  }
  return [];
}

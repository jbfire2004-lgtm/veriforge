/**
 * Regional hierarchy for FieldOS drilldown (reuses VeriSuite geo codes).
 */

import type { RegionLevel, RegionNode } from "./types";

export const REGION_TREE: RegionNode[] = [
  { code: "GLB", label: "Global", level: "global", parentCode: null },
  { code: "NA", label: "North America", level: "continent", parentCode: "GLB" },
  { code: "CA", label: "Canada", level: "country", parentCode: "NA" },
  { code: "US", label: "United States", level: "country", parentCode: "NA" },
  { code: "CA-AB", label: "Alberta", level: "province_state", parentCode: "CA" },
  { code: "CA-BC", label: "British Columbia", level: "province_state", parentCode: "CA" },
  { code: "CA-ON", label: "Ontario", level: "province_state", parentCode: "CA" },
  { code: "US-TX", label: "Texas", level: "province_state", parentCode: "US" },
  { code: "US-NV", label: "Nevada", level: "province_state", parentCode: "US" },
  { code: "CA-AB-north", label: "Northern Alberta", level: "region", parentCode: "CA-AB" },
  { code: "CA-AB-central", label: "Central Alberta", level: "region", parentCode: "CA-AB" },
  { code: "CA-AB-edm", label: "Edmonton metro", level: "city_band", parentCode: "CA-AB-central" },
  { code: "CA-AB-yyc", label: "Calgary metro", level: "city_band", parentCode: "CA-AB-central" },
  { code: "US-TX-gulf", label: "Gulf Coast TX", level: "region", parentCode: "US-TX" },
  { code: "US-TX-dfw", label: "DFW metro", level: "city_band", parentCode: "US-TX" },
];

export function getRegion(code: string): RegionNode | undefined {
  return REGION_TREE.find((n) => n.code === code);
}

export function childrenOf(code: string): RegionNode[] {
  return REGION_TREE.filter((n) => n.parentCode === code);
}

export function breadcrumbs(code: string): RegionNode[] {
  const out: RegionNode[] = [];
  let cur = getRegion(code);
  while (cur) {
    out.unshift(cur);
    cur = cur.parentCode ? getRegion(cur.parentCode) : undefined;
  }
  return out;
}

/** True if fact region is under (or equal to) selected region. */
export function regionMatches(factRegion: string, selected: string): boolean {
  if (selected === "GLB" || selected.toUpperCase() === "GLB") return true;
  const f = factRegion;
  const s = selected;
  if (f.toUpperCase() === s.toUpperCase()) return true;
  if (f.toUpperCase().startsWith(`${s.toUpperCase()}-`)) return true;
  // Walk ancestors using canonical codes (do not uppercase before lookup)
  const chain = breadcrumbs(f).map((b) => b.code.toUpperCase());
  return chain.includes(s.toUpperCase());
}

export function levelOf(code: string): RegionLevel {
  return getRegion(code)?.level ?? "region";
}

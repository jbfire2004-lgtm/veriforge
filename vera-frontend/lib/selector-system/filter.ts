/**
 * Dynamic filtering — cascade available options from catalog + seeded inventory.
 */

import {
  COMPANY_SUBTYPE_LABELS,
  ENTITY_TYPE_LABELS,
  INDUSTRIES,
  INDUSTRY_LABELS,
  PROJECT_SUBTYPE_LABELS,
  SCALE_LABELS,
  SCALES,
  ENTITY_TYPES,
  subtypesFor,
  defaultSubtype,
} from "./catalog";
import { sanitizeSelectorState, assertPlanePureSubtypeList } from "./contamination";
import { getInventoryKeys } from "./store";
import {
  breadcrumbs,
  childrenOf,
  getGeoNode,
} from "@/lib/regional-drilldown-engine/geo";
import type {
  DynamicFilterResult,
  OptionAvailability,
  RegionOption,
  Scale,
  SelectorState,
  Subtype,
} from "./types";

function toRegionOption(
  code: string,
  available: boolean,
): RegionOption | null {
  const node = getGeoNode(code);
  if (!node) return null;
  return {
    code: node.code,
    label: node.label,
    level: node.level,
    parentCode: node.parentCode,
    available,
    industryPoolAllowed: node.industryPoolAllowed,
  };
}

/**
 * Resolve selector state with dynamic filtering.
 * Unavailable subtype/scale combinations snap to the nearest available option.
 */
export function applyDynamicFilters(
  partial: Partial<SelectorState>,
  previous?: SelectorState,
): DynamicFilterResult {
  const { state: sanitized, contamination } = sanitizeSelectorState(
    partial,
    previous,
  );

  const inventory = getInventoryKeys();
  const planeSubtypes = assertPlanePureSubtypeList(sanitized.entityType);

  // Industry availability: available if any inventory row matches entityType
  const industries: OptionAvailability<(typeof INDUSTRIES)[number]>[] =
    INDUSTRIES.map((id) => {
      const available = inventory.some(
        (k) => k.entityType === sanitized.entityType && k.industry === id,
      );
      return {
        id,
        label: INDUSTRY_LABELS[id],
        available,
        reason: available ? undefined : "No entities in inventory for this plane",
      };
    });

  let industry = sanitized.industry;
  if (!industries.find((i) => i.id === industry)?.available) {
    const first = industries.find((i) => i.available);
    if (first) {
      industry = first.id;
      contamination.correctedFields.push("industry");
      contamination.messages.push(`Industry snapped to ${first.label}.`);
    }
  }

  const entityTypes: OptionAvailability<(typeof ENTITY_TYPES)[number]>[] =
    ENTITY_TYPES.map((id) => ({
      id,
      label: ENTITY_TYPE_LABELS[id],
      available: inventory.some((k) => k.entityType === id),
    }));

  // Subtypes for active plane only — never mix
  const subtypes: OptionAvailability<Subtype>[] = planeSubtypes.map((id) => {
    const available = inventory.some(
      (k) =>
        k.entityType === sanitized.entityType &&
        k.industry === industry &&
        k.subtype === id,
    );
    const label =
      sanitized.entityType === "project"
        ? PROJECT_SUBTYPE_LABELS[id as keyof typeof PROJECT_SUBTYPE_LABELS]
        : COMPANY_SUBTYPE_LABELS[id as keyof typeof COMPANY_SUBTYPE_LABELS];
    return {
      id,
      label: label ?? id,
      available,
      reason: available ? undefined : "No matching entities",
    };
  });

  let subtype = sanitized.subtype;
  if (!isValidOnList(subtypes, subtype)) {
    subtype =
      (subtypes.find((s) => s.available)?.id as Subtype) ??
      defaultSubtype(sanitized.entityType);
    if (!contamination.correctedFields.includes("subtype")) {
      contamination.correctedFields.push("subtype");
      contamination.messages.push(`Subtype snapped to ${subtype}.`);
    }
  }

  const scales: OptionAvailability<Scale>[] = SCALES.map((id) => {
    const available = inventory.some(
      (k) =>
        k.entityType === sanitized.entityType &&
        k.industry === industry &&
        k.subtype === subtype &&
        k.scale === id,
    );
    return {
      id,
      label: SCALE_LABELS[id],
      available,
      reason: available ? undefined : "No matching entities at this scale",
    };
  });

  let scale = sanitized.scale;
  if (!scales.find((s) => s.id === scale)?.available) {
    const first = scales.find((s) => s.available);
    if (first) {
      scale = first.id;
      contamination.correctedFields.push("scale");
      contamination.messages.push(`Scale snapped to ${first.label}.`);
    }
  }

  // Region drilldown
  let regionCode = sanitized.regionCode;
  if (!getGeoNode(regionCode)) {
    regionCode = "GLB";
    contamination.correctedFields.push("regionCode");
    contamination.messages.push("Invalid region — reset to Global.");
  }
  const currentNode = getGeoNode(regionCode)!;
  const regionAvailable = (code: string) =>
    inventory.some(
      (k) =>
        k.entityType === sanitized.entityType &&
        k.industry === industry &&
        (code === "GLB" ||
          k.regionCode === code ||
          k.regionCode.startsWith(`${code}-`) ||
          breadcrumbs(k.regionCode).some((b) => b.code === code)),
    );

  const crumbs = breadcrumbs(regionCode)
    .map((n) => toRegionOption(n.code, regionAvailable(n.code)))
    .filter((x): x is RegionOption => !!x);
  const children = childrenOf(regionCode)
    .map((n) => toRegionOption(n.code, regionAvailable(n.code)))
    .filter((x): x is RegionOption => !!x);

  const resolved: SelectorState = {
    industry,
    entityType: sanitized.entityType,
    subtype,
    scale,
    regionCode,
  };

  return {
    industries,
    entityTypes,
    subtypes,
    scales,
    regions: {
      breadcrumbs: crumbs,
      children,
      current: {
        code: currentNode.code,
        label: currentNode.label,
        level: currentNode.level,
        parentCode: currentNode.parentCode,
        available: regionAvailable(currentNode.code),
        industryPoolAllowed: currentNode.industryPoolAllowed,
      },
    },
    resolved,
    contamination,
  };
}

function isValidOnList(
  list: OptionAvailability<Subtype>[],
  id: Subtype,
): boolean {
  const hit = list.find((s) => s.id === id);
  return !!hit?.available;
}

export { subtypesFor };

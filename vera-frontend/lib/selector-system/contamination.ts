/**
 * Cross-contamination guards — keep project/company planes and subtype sets isolated.
 */

import { defaultSubtype, isValidSubtype, subtypesFor } from "./catalog";
import type {
  ContaminationReport,
  EntityType,
  SelectorState,
  Subtype,
} from "./types";

/**
 * Prevent cross-contamination:
 * - Changing entity type resets subtype to the other plane's default (never keep project subtype on company plane).
 * - Rejects subtypes that don't belong to the active entity type.
 * - Never blends project + company option lists.
 */
export function sanitizeSelectorState(
  incoming: Partial<SelectorState>,
  previous?: SelectorState,
): { state: SelectorState; contamination: ContaminationReport } {
  const messages: string[] = [];
  const correctedFields: Array<keyof SelectorState> = [];

  const entityType: EntityType =
    incoming.entityType ?? previous?.entityType ?? "project";

  let subtype: Subtype =
    (incoming.subtype as Subtype | undefined) ??
    previous?.subtype ??
    defaultSubtype(entityType);

  const entityChanged =
    previous != null && previous.entityType !== entityType;
  const invalidSubtype = !isValidSubtype(entityType, subtype);

  if (entityChanged || invalidSubtype) {
    const next = defaultSubtype(entityType);
    if (subtype !== next) {
      messages.push(
        entityChanged
          ? `Entity type switched to ${entityType} — subtype reset to ${next} to prevent plane contamination.`
          : `Subtype "${subtype}" is invalid for ${entityType} — corrected to ${next}.`,
      );
      correctedFields.push("subtype");
      subtype = next;
    }
  }

  // If caller tried to pass a subtype from the other plane without changing entityType
  if (
    incoming.subtype &&
    !isValidSubtype(entityType, incoming.subtype) &&
    !correctedFields.includes("subtype")
  ) {
    subtype = defaultSubtype(entityType);
    correctedFields.push("subtype");
    messages.push(
      `Blocked cross-plane subtype "${incoming.subtype}" on ${entityType} plane.`,
    );
  }

  const state: SelectorState = {
    industry: incoming.industry ?? previous?.industry ?? "construction",
    entityType,
    subtype,
    scale: incoming.scale ?? previous?.scale ?? "large",
    regionCode: incoming.regionCode ?? previous?.regionCode ?? "GLB",
  };

  return {
    state,
    contamination: {
      planesIsolated: true,
      crossPlaneBlocked: entityChanged || invalidSubtype,
      invalidSubtypeForEntity: invalidSubtype,
      correctedFields,
      messages,
    },
  };
}

/** Ensure subtype option list never mixes planes. */
export function assertPlanePureSubtypeList(entityType: EntityType): Subtype[] {
  const list = subtypesFor(entityType);
  const other = entityType === "project" ? "company" : "project";
  const leaked = list.filter((s) => !isValidSubtype(entityType, s));
  if (leaked.length) {
    throw new Error(`Subtype list contamination on ${entityType}: ${leaked.join(",")}`);
  }
  // Soft check: no overlap with other plane defaults
  const otherList = subtypesFor(other as EntityType);
  const overlap = list.filter((s) => otherList.includes(s));
  if (overlap.length) {
    // Project and company subtype unions are intentionally disjoint in this catalog
    throw new Error(`Cross-plane subtype overlap: ${overlap.join(",")}`);
  }
  return list;
}

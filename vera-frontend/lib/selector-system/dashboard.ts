/**
 * Auto-update dashboard content from selector state.
 */

import {
  ENTITY_TYPE_LABELS,
  INDUSTRY_LABELS,
  SCALE_LABELS,
  subtypeLabel,
  DEFAULT_SELECTOR_STATE,
} from "./catalog";
import { applyDynamicFilters } from "./filter";
import { getFactsMatching, getRevision } from "./store";
import type { DashboardContent, SelectorState } from "./types";

const MIN_SAMPLE = 5;
const HOURS_DENOMINATOR = 200_000;

function ratePer200k(count: number, hours: number): number {
  if (hours <= 0) return 0;
  return Math.round((count / hours) * HOURS_DENOMINATOR * 100) / 100;
}

function mean(vals: number[]): number | null {
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}

/** Build dashboard payload — always re-derived from current selectors (auto-update). */
export function buildDashboardFromSelectors(
  partial?: Partial<SelectorState>,
  previous?: SelectorState,
): DashboardContent {
  const filter = applyDynamicFilters(
    partial ?? DEFAULT_SELECTOR_STATE,
    previous,
  );
  const selectors = filter.resolved;
  const facts = getFactsMatching(selectors);
  const tokens = new Set(facts.map((f) => f.token));
  const suppressed = tokens.size < MIN_SAMPLE;

  const hours = facts.reduce((s, f) => s + f.hours, 0);
  const metrics = suppressed
    ? {
        suppressed: true,
        entityCount: null,
        trif: null,
        ltif: null,
        leadingMaturity: null,
        severityIndex: null,
      }
    : {
        suppressed: false,
        entityCount: tokens.size,
        trif: ratePer200k(
          facts.reduce((s, f) => s + f.recordables, 0),
          hours,
        ),
        ltif: ratePer200k(
          facts.reduce((s, f) => s + f.lostTime, 0),
          hours,
        ),
        leadingMaturity: mean(facts.map((f) => f.leadingMaturity)),
        severityIndex: mean(facts.map((f) => f.severityWeight)),
      };

  return {
    generatedAt: new Date().toISOString(),
    revision: getRevision(),
    selectors,
    filter,
    metrics,
    context: {
      plane: selectors.entityType,
      subtypeLabel: subtypeLabel(selectors.entityType, selectors.subtype),
      scaleLabel: SCALE_LABELS[selectors.scale],
      industryLabel: INDUSTRY_LABELS[selectors.industry],
      regionLabel: filter.regions.current.label,
      regionLevel: filter.regions.current.level,
    },
    rules: {
      dynamicFiltering: true,
      preventCrossContamination: true,
      autoUpdateDashboard: true,
      minSample: MIN_SAMPLE,
      hoursDenominator: 200000,
    },
  };
}

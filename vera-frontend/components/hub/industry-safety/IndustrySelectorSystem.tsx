"use client";

import type { IndustrySelectorState } from "@/lib/hub/industry-safety/types";
import {
  INDUSTRY_LABELS,
  PROJECT_SUBTYPE_LABELS,
  COMPANY_SUBTYPE_LABELS,
  SCALE_LABELS,
  PROJECT_SUBTYPES,
  COMPANY_SUBTYPES,
  type IndustryCode,
  type ProjectSubtype,
  type CompanySubtype,
  type ScaleBand,
  type EntityType,
} from "@/lib/hub/industry-safety/types";
import type { PlaneSwitchWarning } from "@/lib/hub/industry-safety/useIndustrySelectorSystem";
import {
  visiEyebrowClass,
  visiFieldClass,
  visiLabelClass,
  visiMutedClass,
  visiPanelClass,
  visiPillClass,
  visiPrimaryBtnClass,
  visiSecondaryBtnClass,
  visiSegmentClass,
  visiSegmentTrackClass,
  visiTitleClass,
} from "./visi-ui";

type Props = {
  state: IndustrySelectorState;
  onPatch: (partial: Partial<IndustrySelectorState>) => void;
  availableIndustries: string[];
  availableSubtypes: string[];
  availableScales: ScaleBand[];
  sampleForCurrent: number | null;
  loadingAvailability?: boolean;
  disabled?: boolean;
  planeWarning: PlaneSwitchWarning;
  onConfirmPlaneSwitch: () => void;
  onCancelPlaneSwitch: () => void;
  onRequestEntityType: (to: EntityType) => void;
};

export function IndustrySelectorSystem({
  state,
  onPatch,
  availableIndustries,
  availableSubtypes,
  availableScales,
  sampleForCurrent,
  loadingAvailability,
  disabled,
  planeWarning,
  onConfirmPlaneSwitch,
  onCancelPlaneSwitch,
  onRequestEntityType,
}: Props) {
  const subtypeLabels =
    state.entityType === "project"
      ? PROJECT_SUBTYPE_LABELS
      : COMPANY_SUBTYPE_LABELS;

  const subtypeIds =
    state.entityType === "project" ? PROJECT_SUBTYPES : COMPANY_SUBTYPES;

  const visibleSubtypes = subtypeIds.filter((id) =>
    availableSubtypes.includes(id),
  );

  const visibleIndustries = (
    Object.keys(INDUSTRY_LABELS) as IndustryCode[]
  ).filter((id) => availableIndustries.includes(id));

  const visibleScales = (Object.keys(SCALE_LABELS) as ScaleBand[]).filter((id) =>
    availableScales.includes(id),
  );

  return (
    <div className="space-y-3">
      <div className={visiPanelClass}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[#2A2E33]/08 pb-4">
          <div>
            <p className={visiEyebrowClass}>Cohort filters</p>
            <h3 className={`mt-1 ${visiTitleClass}`}>Industry selector</h3>
            <p className={`mt-1 ${visiMutedClass}`}>
              Segments with fewer than 5 entities are omitted automatically
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={visiPillClass}>
              {state.entityType === "project" ? "Project plane" : "Company plane"}
            </span>
            <span className={visiPillClass}>
              {loadingAvailability
                ? "Refreshing…"
                : sampleForCurrent != null
                  ? `Sample n=${sampleForCurrent}`
                  : "Sample pending"}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block">
            <span className={visiLabelClass}>Industry</span>
            <select
              className={visiFieldClass}
              disabled={disabled || loadingAvailability}
              value={state.industry}
              onChange={(e) =>
                onPatch({ industry: e.target.value as IndustryCode })
              }
            >
              {visibleIndustries.length === 0 ? (
                <option value={state.industry}>No industries ≥5</option>
              ) : (
                visibleIndustries.map((id) => (
                  <option key={id} value={id}>
                    {INDUSTRY_LABELS[id]}
                  </option>
                ))
              )}
            </select>
          </label>

          <fieldset className="block">
            <legend className={visiLabelClass}>Entity type</legend>
            <div className={visiSegmentTrackClass}>
              {(["project", "company"] as const).map((type) => {
                const active = state.entityType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={disabled}
                    onClick={() => onRequestEntityType(type)}
                    className={visiSegmentClass(active)}
                    aria-pressed={active}
                  >
                    {type === "project" ? "Project" : "Company"}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block">
            <span className={visiLabelClass}>
              {state.entityType === "project" ? "Project type" : "Company type"}
            </span>
            <select
              className={visiFieldClass}
              disabled={
                disabled || loadingAvailability || visibleSubtypes.length === 0
              }
              value={state.subtype}
              onChange={(e) =>
                onPatch({
                  subtype: e.target.value as ProjectSubtype | CompanySubtype,
                })
              }
            >
              {visibleSubtypes.length === 0 ? (
                <option value={state.subtype}>No subtypes ≥5</option>
              ) : (
                visibleSubtypes.map((id) => (
                  <option key={id} value={id}>
                    {subtypeLabels[id as keyof typeof subtypeLabels]}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="block">
            <span className={visiLabelClass}>Scale</span>
            <select
              className={visiFieldClass}
              disabled={
                disabled || loadingAvailability || visibleScales.length === 0
              }
              value={state.scale}
              onChange={(e) => onPatch({ scale: e.target.value as ScaleBand })}
            >
              {visibleScales.length === 0 ? (
                <option value={state.scale}>No scales ≥5</option>
              ) : (
                visibleScales.map((id) => (
                  <option key={id} value={id}>
                    {SCALE_LABELS[id]}
                  </option>
                ))
              )}
            </select>
          </label>

          <label className="block">
            <span className={visiLabelClass}>Period</span>
            <input
              className={visiFieldClass}
              disabled={disabled}
              value={state.period}
              placeholder="YYYY-Qn or YYYY-MM"
              onChange={(e) => onPatch({ period: e.target.value })}
            />
          </label>
        </div>
      </div>

      {planeWarning ? (
        <div
          role="alertdialog"
          aria-labelledby="visi-plane-switch-title"
          aria-describedby="visi-plane-switch-desc"
          className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5 shadow-sm"
        >
          <h3
            id="visi-plane-switch-title"
            className="text-sm font-semibold text-[#2A2E33]"
          >
            Switch from {planeWarning.from} to {planeWarning.to} view?
          </h3>
          <p
            id="visi-plane-switch-desc"
            className="mt-1.5 text-sm leading-relaxed text-[#5a6b7c]"
          >
            {planeWarning.message}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onConfirmPlaneSwitch}
              className={visiPrimaryBtnClass}
            >
              Switch to {planeWarning.to}
            </button>
            <button
              type="button"
              onClick={onCancelPlaneSwitch}
              className={visiSecondaryBtnClass}
            >
              Stay on {planeWarning.from}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

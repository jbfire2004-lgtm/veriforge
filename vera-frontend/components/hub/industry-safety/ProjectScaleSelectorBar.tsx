"use client";

import type { ProjectScaleSelectors } from "@/lib/hub/industry-safety/types";
import {
  INDUSTRY_LABELS,
  PROJECT_SUBTYPE_LABELS,
  SCALE_LABELS,
  INDUSTRIES,
  PROJECT_SUBTYPES,
  SCALES,
  type IndustryCode,
  type ProjectSubtype,
  type ScaleBand,
} from "@/lib/hub/industry-safety/types";
import {
  visiEyebrowClass,
  visiFieldClass,
  visiLabelClass,
  visiMutedClass,
  visiPanelClass,
  visiPillClass,
} from "./visi-ui";

type Props = {
  value: ProjectScaleSelectors;
  onChange: (next: ProjectScaleSelectors) => void;
  disabled?: boolean;
};

export function ProjectScaleSelectorBar({ value, onChange, disabled }: Props) {
  function patch<K extends keyof ProjectScaleSelectors>(
    key: K,
    next: ProjectScaleSelectors[K],
  ) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className={visiPanelClass}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className={visiEyebrowClass}>Project-scale only</p>
          <p className={`mt-1 text-sm ${visiMutedClass}`}>
            Benchmarks against industry projects of similar type and scale.
            Company data is excluded unless you opt into cross-category
            comparison.
          </p>
        </div>
        <span className={visiPillClass}>
          Min sample n≥5 · Tokenized project IDs
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className={visiLabelClass}>Industry</span>
          <select
            className={visiFieldClass}
            disabled={disabled}
            value={value.industry}
            onChange={(e) => patch("industry", e.target.value as IndustryCode)}
          >
            {INDUSTRIES.map((id) => (
              <option key={id} value={id}>
                {INDUSTRY_LABELS[id]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={visiLabelClass}>Project type</span>
          <select
            className={visiFieldClass}
            disabled={disabled}
            value={value.projectType}
            onChange={(e) =>
              patch("projectType", e.target.value as ProjectSubtype)
            }
          >
            {PROJECT_SUBTYPES.map((id) => (
              <option key={id} value={id}>
                {PROJECT_SUBTYPE_LABELS[id]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={visiLabelClass}>Scale</span>
          <select
            className={visiFieldClass}
            disabled={disabled}
            value={value.scale}
            onChange={(e) => patch("scale", e.target.value as ScaleBand)}
          >
            {SCALES.map((id) => (
              <option key={id} value={id}>
                {SCALE_LABELS[id]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={visiLabelClass}>Period</span>
          <input
            className={visiFieldClass}
            disabled={disabled}
            value={value.period}
            placeholder="YYYY-Qn or YYYY-MM"
            onChange={(e) => patch("period", e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

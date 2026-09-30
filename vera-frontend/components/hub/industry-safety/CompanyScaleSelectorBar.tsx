"use client";

import type { CompanyScaleSelectors } from "@/lib/hub/industry-safety/types";
import {
  INDUSTRY_LABELS,
  COMPANY_SUBTYPE_LABELS,
  SCALE_LABELS,
  INDUSTRIES,
  COMPANY_SUBTYPES,
  SCALES,
  type IndustryCode,
  type CompanySubtype,
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
  value: CompanyScaleSelectors;
  onChange: (next: CompanyScaleSelectors) => void;
  disabled?: boolean;
};

export function CompanyScaleSelectorBar({ value, onChange, disabled }: Props) {
  function patch<K extends keyof CompanyScaleSelectors>(
    key: K,
    next: CompanyScaleSelectors[K],
  ) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className={visiPanelClass}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className={visiEyebrowClass}>Company-scale only</p>
          <p className={`mt-1 text-sm ${visiMutedClass}`}>
            Benchmarks against industry companies of similar type and scale.
            Project data is excluded unless you opt into cross-category
            comparison.
          </p>
        </div>
        <span className={visiPillClass}>
          Min sample n≥5 · Tokenized company IDs
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
          <span className={visiLabelClass}>Company type</span>
          <select
            className={visiFieldClass}
            disabled={disabled}
            value={value.companyType}
            onChange={(e) =>
              patch("companyType", e.target.value as CompanySubtype)
            }
          >
            {COMPANY_SUBTYPES.map((id) => (
              <option key={id} value={id}>
                {COMPANY_SUBTYPE_LABELS[id]}
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

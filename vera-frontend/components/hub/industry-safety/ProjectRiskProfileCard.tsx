"use client";

import type { ProjectRiskProfile } from "@/lib/hub/industry-safety/types";
import { ProgressRow, ScoreMeter } from "./visi-charts";
import { visiCardMutedClass, visiMutedClass, visiTitleClass } from "./visi-ui";

const bandTone: Record<ProjectRiskProfile["band"], string> = {
  low: "border-[#2A2E33]/10 shadow-[inset_3px_0_0_#2F8F8C]",
  moderate: "border-[#2A2E33]/10 shadow-[inset_3px_0_0_#94a3b8]",
  elevated: "border-[#2A2E33]/10 shadow-[inset_3px_0_0_#C89F3D]",
  critical: "border-[#2A2E33]/10 shadow-[inset_3px_0_0_#B33A3A]",
};

const bandMeter: Record<
  ProjectRiskProfile["band"],
  "teal" | "amber" | "rose"
> = {
  low: "teal",
  moderate: "teal",
  elevated: "amber",
  critical: "rose",
};

export function ProjectRiskProfileCard({
  profile,
  suppressed,
}: {
  profile: ProjectRiskProfile;
  suppressed?: boolean;
}) {
  if (suppressed) {
    return (
      <section className={visiCardMutedClass}>
        <h3 className={visiTitleClass}>Project risk profile</h3>
        <p className={`mt-1 ${visiMutedClass}`}>
          Scoring hidden until at least 5 tokenized projects are in cohort.
        </p>
      </section>
    );
  }

  return (
    <section
      className={`rounded-2xl border bg-white p-5 shadow-sm ${bandTone[profile.band]}`}
    >
      <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className={visiTitleClass}>Project risk profile</h3>
          <p className={`mt-0.5 ${visiMutedClass}`}>
            Industry-relative cohort score
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-[#2A2E33]">
            {profile.score}
          </p>
          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#5a6b7c]">
            {profile.band} · {(profile.confidence * 100).toFixed(0)}% conf
          </p>
        </div>
      </header>
      <ScoreMeter
        score={profile.score}
        tone={bandMeter[profile.band]}
      />
      <ul className="mt-4 space-y-3">
        {profile.drivers.map((d, i) => (
          <ProgressRow
            key={d.code}
            label={d.label}
            share={d.weight}
            tone={i === 0 ? "rose" : i === 1 ? "amber" : "navy"}
          />
        ))}
      </ul>
    </section>
  );
}

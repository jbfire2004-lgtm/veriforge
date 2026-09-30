"use client";

import { CivilizationSection } from "@/components/civilization/CivilizationSection";
import { InterstellarSection } from "@/components/interstellar/InterstellarSection";
import { InterplanetarySection } from "@/components/interplanetary/InterplanetarySection";
import { EnterpriseBrainSection } from "@/components/enterprise-brain/EnterpriseBrainSection";

type Props = {
  companyId: number;
  unionHallId?: number;
};

export function IntelligenceCommandStack({ companyId, unionHallId }: Props) {
  return (
    <div className="space-y-6 rounded-xl border-2 border-violet-200/80 bg-gradient-to-b from-violet-50/80 to-white p-4 md:p-6 shadow-sm">
      <div className="border-b border-violet-200/60 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">
          Vera intelligence stack
        </p>
        <h2 className="text-lg font-semibold text-vera-charcoal mt-1">
          AI command layers (Phases 5–16)
        </h2>
        <p className="text-sm text-vera-muted mt-1">
          Universal civilization engine, multi-star maps, interstellar expansion, interplanetary
          operations, planetary coordination, and autonomous enterprise brain — scoped to company #
          {companyId}. Preview / down-the-road capabilities.
        </p>
      </div>

      <CivilizationSection companyId={companyId} />
      <InterstellarSection companyId={companyId} />
      <InterplanetarySection companyId={companyId} />
      <EnterpriseBrainSection companyId={companyId} unionHallId={unionHallId} />
    </div>
  );
}

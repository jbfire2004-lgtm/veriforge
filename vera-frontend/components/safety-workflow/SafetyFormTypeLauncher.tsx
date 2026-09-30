"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Eye,
  Flame,
  HardHat,
  Scan,
  Zap,
} from "lucide-react";
import {
  createSafetyWorkflowForm,
  SAFETY_FORM_TYPE_LABELS,
  type SafetyFormType,
} from "@/lib/safety-workflow";
import { buttonStyles } from "@/components/ui/button";

const FORM_TYPES: Array<{
  type: SafetyFormType;
  icon: typeof HardHat;
  tone: string;
}> = [
  { type: "JHA", icon: HardHat, tone: "border-vera-teal/40 bg-vera-teal/5" },
  { type: "FLHA", icon: ClipboardCheck, tone: "border-vera-blue/40 bg-vera-blue/5" },
  { type: "SIF", icon: Flame, tone: "border-vera-coral/40 bg-vera-coral/5" },
  { type: "HECA", icon: Eye, tone: "border-vera-amber/40 bg-vera-amber/5" },
  { type: "ENERGY_WHEEL", icon: Zap, tone: "border-violet-400/40 bg-violet-50" },
  { type: "INSPECTION", icon: Scan, tone: "border-slate-400/40 bg-slate-50" },
];

type Props = {
  projectId: number;
  companyId?: number;
  workerId?: number;
};

export function SafetyFormTypeLauncher({ projectId, companyId, workerId }: Props) {
  const router = useRouter();

  async function start(type: SafetyFormType) {
    const form = await createSafetyWorkflowForm({
      formType: type,
      projectId,
      companyId,
      workerId,
    });
    router.push(`/safety/${form.id}`);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {FORM_TYPES.map(({ type, icon: Icon, tone }) => (
        <button
          key={type}
          type="button"
          onClick={() => void start(type)}
          className={`flex min-h-[88px] items-start gap-3 rounded-2xl border p-4 text-left transition hover:shadow-md ${tone}`}
        >
          <Icon className="mt-0.5 h-6 w-6 shrink-0" aria-hidden />
          <span>
            <span className="block font-medium text-vera-deep">{type.replace("_", " ")}</span>
            <span className="mt-1 block text-sm text-vera-muted">
              {SAFETY_FORM_TYPE_LABELS[type]}
            </span>
          </span>
        </button>
      ))}
      <Link
        href={`/supervisor/safety/review?projectId=${projectId}`}
        className={`${buttonStyles({ variant: "outline" })} min-h-[88px] justify-start rounded-2xl p-4`}
      >
        Review submitted forms
      </Link>
    </div>
  );
}

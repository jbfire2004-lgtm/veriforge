"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { WorkspaceHero } from "@/components/theme/workspace";
import type { BriefingFormValues } from "@/lib/briefing/briefing-schema";
import type { GeneratedBriefing } from "@/lib/briefing/briefing-types";
import { BriefingForm } from "./BriefingForm";
import { BriefingPreview } from "./BriefingPreview";

async function requestBriefing(values: BriefingFormValues): Promise<GeneratedBriefing> {
  const res = await fetch("/api/briefing/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? "Failed to generate briefing");
  }
  return res.json() as Promise<GeneratedBriefing>;
}

export function BriefingGeneratorView() {
  const [briefing, setBriefing] = useState<GeneratedBriefing | null>(null);

  const mutation = useMutation({
    mutationFn: requestBriefing,
    onSuccess: (data) => setBriefing(data),
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <Link
        href="/hub"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#2F8F8C] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to Vera Hub
      </Link>

      <WorkspaceHero
        eyebrow="Vera Hub"
        title="Daily Safety Briefing Generator"
        description="Build toolbox talks, FLHAs, and crew briefings with live weather from your hazard bar, structured hazards, and controls — ready to export or share."
        badges={[{ label: "AI-ready", tone: "teal" }]}
      />

      {mutation.isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Could not generate briefing."}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <BriefingForm
          onSubmit={(values) => mutation.mutate(values)}
          generating={mutation.isPending}
        />
        <BriefingPreview briefing={briefing} loading={mutation.isPending} />
      </div>
    </div>
  );
}

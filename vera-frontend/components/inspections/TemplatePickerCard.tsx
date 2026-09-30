"use client";

import { SfButton, SfCard } from "@/src/components/safety-forms/ui";
import type { PmInspectionTemplate } from "@/lib/pm-inspections";

type TemplatePickerCardProps = {
  template: PmInspectionTemplate;
  busy?: boolean;
  disabled?: boolean;
  actionLabel?: string;
  onStart: (templateId: string) => void;
  subtitle?: string;
};

export function TemplatePickerCard({
  template,
  busy,
  disabled,
  actionLabel = "Start",
  onStart,
  subtitle,
}: TemplatePickerCardProps) {
  return (
    <SfCard className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="font-medium">{template.name}</p>
        {template.description ? (
          <p className="mt-1 text-sm text-[var(--sf-text-muted)]">{template.description}</p>
        ) : null}
        <p className="mt-1 text-xs text-[var(--sf-text-muted)]">
          {subtitle ??
            `${template.category} · ${(template.items ?? []).length} items · ${template.scoringMode}`}
        </p>
      </div>
      <SfButton
        type="button"
        disabled={disabled || busy}
        onClick={() => onStart(template.id)}
      >
        {busy ? "Starting…" : actionLabel}
      </SfButton>
    </SfCard>
  );
}

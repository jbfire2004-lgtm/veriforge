"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchSafetyFormDefinition } from "@/lib/safety-forms";
import { SafetyFormEngine } from "@/src/components/safety-forms/engine";
import type { SafetyFormDefinition } from "@/src/components/safety-forms/engine/types";
import { safetyFormErrorMessage } from "@/lib/safety-form-errors";

type Props = {
  definitionId: string;
  projectId?: number;
  workerId?: number;
  companyId?: number;
};

export default function SafetyFormFillPage({
  definitionId,
  projectId,
  workerId,
  companyId,
}: Props) {
  const [definition, setDefinition] = useState<SafetyFormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchSafetyFormDefinition(definitionId)
      .then(setDefinition)
      .catch((e) => setError(safetyFormErrorMessage(e, "Could not load form")))
      .finally(() => setLoading(false));
  }, [definitionId]);

  if (loading) {
    return (
      <p className="p-8 text-sm text-[var(--sf-text-muted)]">Loading form…</p>
    );
  }

  if (error || !definition) {
    return (
      <div className="p-8">
        <p className="text-sm text-[var(--sf-danger)]">{error ?? "Form not found"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <nav className="mb-6 text-sm text-[var(--sf-text-muted)]">
        <Link href="/pm/safety-forms" className="hover:text-[var(--sf-primary)]">
          Safety forms
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--sf-text)]">{definition.name}</span>
      </nav>
      <SafetyFormEngine
        definition={definition}
        projectId={projectId}
        workerId={workerId}
        companyId={companyId}
      />
    </div>
  );
}

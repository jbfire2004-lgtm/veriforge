"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPmCorrectiveAction } from "@/lib/pm-corrective-actions";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

const ACTION_TYPES = [
  { value: "immediate", label: "Immediate action" },
  { value: "interim_control", label: "Interim control" },
  { value: "permanent", label: "Permanent corrective action" },
  { value: "preventive", label: "Preventive action" },
  { value: "equipment_repair", label: "Equipment repair" },
  { value: "training_requirement", label: "Training requirement" },
  { value: "policy_update", label: "Policy update" },
];

export default function PmCapaNewPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [actionType, setActionType] = useState("permanent");
  const [severity, setSeverity] = useState("medium");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const row = await createPmCorrectiveAction({
        companyId,
        projectId,
        sourceModule: "manual",
        sourceId: `manual-${Date.now()}`,
        title,
        description,
        actionType,
        severity,
      });
      router.push(`/pm/corrective-actions/${row.id}?projectId=${projectId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">New corrective action</h1>
      <SfCard className="space-y-4 p-5">
        <select
          className="w-full rounded border px-2 py-1 text-sm"
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
        >
          {ACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded border px-2 py-1 text-sm"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <input
          className="w-full rounded border px-2 py-1 text-sm"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full rounded border px-2 py-1 text-sm"
          rows={4}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <SfButton type="button" disabled={loading || !title} onClick={() => void submit()}>
          Create & assign to CAIL
        </SfButton>
      </SfCard>
    </div>
  );
}

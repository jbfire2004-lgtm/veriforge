"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import type { ValidationReport } from "@/lib/api/training-standards";
import { buttonStyles } from "@/components/ui/button";

export function ProviderInstructorCompliance({
  providerId,
}: {
  providerId: number;
}) {
  const [providerReport, setProviderReport] = useState<ValidationReport | null>(null);
  const [instructorId, setInstructorId] = useState("");
  const [instructorReport, setInstructorReport] = useState<ValidationReport | null>(null);
  const [pending, setPending] = useState(false);

  async function runProviderCheck() {
    setPending(true);
    try {
      const r = await apiPost<ValidationReport>(
        "/api/v1/training-standards/validate/provider",
        { trainingProviderId: providerId }
      );
      setProviderReport(r);
    } finally {
      setPending(false);
    }
  }

  async function runInstructorCheck() {
    if (!instructorId) return;
    setPending(true);
    try {
      const r = await apiPost<ValidationReport>(
        "/api/v1/training-standards/validate/instructor",
        { instructorId: Number(instructorId) }
      );
      setInstructorReport(r);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Provider qualification</h2>
        <button
          type="button"
          className={buttonStyles({ variant: "outline", size: "sm" })}
          onClick={runProviderCheck}
          disabled={pending}
        >
          Validate provider
        </button>
        {providerReport && <ReportView report={providerReport} />}
      </section>

      <section className="rounded-lg border p-4 space-y-3 mt-6">
        <h2 className="font-medium">Instructor qualification</h2>
        <input
          className="w-full max-w-xs rounded border px-3 py-2 text-sm"
          placeholder="Instructor ID"
          value={instructorId}
          onChange={(e) => setInstructorId(e.target.value)}
        />
        <button
          type="button"
          className={buttonStyles({ variant: "outline", size: "sm" })}
          onClick={runInstructorCheck}
          disabled={pending || !instructorId}
        >
          Validate instructor
        </button>
        {instructorReport && <ReportView report={instructorReport} />}
      </section>
    </>
  );
}

function ReportView({ report }: { report: ValidationReport }) {
  return (
    <div className="text-sm space-y-2">
      <p>
        Outcome: <strong>{report.outcome}</strong> · Score {report.score}% ·{" "}
        {report.jurisdictionCode}
      </p>
      {report.issues.length > 0 && (
        <ul className="list-disc pl-5 text-amber-800">
          {report.issues.map((i, idx) => (
            <li key={idx}>
              {i.code}: {i.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

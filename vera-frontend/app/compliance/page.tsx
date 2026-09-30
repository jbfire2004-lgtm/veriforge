"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ContentContainer,
  PageLayout,
} from "@/src/components/navigation";
import { getVeriHubSession } from "@/lib/verihub-org-api";
import { getHiringClientSession } from "@/lib/hiring-client-api";
import {
  getOrgCompliance,
  listPendingCompliance,
  reviewComplianceArtifact,
  uploadComplianceArtifact,
  type ComplianceArtifact,
} from "@/lib/compliance-api";

export default function ComplianceDashboardPage() {
  const [mode, setMode] = useState<"org" | "hiring" | "none">("none");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<ComplianceArtifact[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [reminders, setReminders] = useState<
    { artifactId: string; type: string; kind: string }[]
  >([]);
  const [pending, setPending] = useState<
    (ComplianceArtifact & {
      organization: { id: string; name: string; slug: string };
    })[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function reloadOrg(id: string) {
    const data = await getOrgCompliance(id);
    setArtifacts(data.artifacts ?? []);
    setScore(data.scorecard?.complianceScore ?? null);
    setReminders(data.reminders ?? []);
  }

  async function reloadPending() {
    const data = await listPendingCompliance();
    setPending(data.items ?? []);
  }

  useEffect(() => {
    const org = getVeriHubSession();
    const hc = getHiringClientSession();
    if (org?.orgId) {
      setMode("org");
      setOrgId(org.orgId);
      reloadOrg(org.orgId).catch((err: Error) => setError(err.message));
    } else if (hc) {
      setMode("hiring");
      reloadPending().catch((err: Error) => setError(err.message));
    } else {
      setMode("none");
    }
  }, []);

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    try {
      await uploadComplianceArtifact({
        type: String(fd.get("type") || "insurance"),
        fileUrl: String(fd.get("fileUrl") || ""),
        expiryDate: String(fd.get("expiryDate") || "") || null,
        label: String(fd.get("label") || "") || undefined,
      });
      setMessage("Artifact uploaded — pending review.");
      e.currentTarget.reset();
      if (orgId) await reloadOrg(orgId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function onReview(id: string, decision: "approve" | "reject") {
    setError(null);
    try {
      await reviewComplianceArtifact(id, decision);
      setMessage(`Artifact ${decision}d.`);
      await reloadPending();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
    }
  }

  return (
    <ContentContainer>
      <PageLayout
        title="Compliance engine"
        description="Insurance, WCB, COR, SCSA, and custom artifacts — uploads, reviews, renewals, and scorecard weighting."
      >
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
        {message ? (
          <p className="mb-4 text-sm text-emerald-700">{message}</p>
        ) : null}

        {mode === "none" ? (
          <div className="space-y-2 text-sm text-zinc-600">
            <p>Sign in to upload or review compliance artifacts.</p>
            <p>
              Contractors:{" "}
              <Link className="underline" href="/verihub/signup">
                VeriHub org signup
              </Link>
            </p>
            <p>
              Hiring clients:{" "}
              <Link className="underline" href="/client/login">
                Hiring client sign in
              </Link>
            </p>
          </div>
        ) : null}

        {mode === "org" ? (
          <div className="space-y-8">
            <section className="border border-zinc-200 bg-white p-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Scorecard
              </h2>
              <p className="text-3xl font-semibold">
                {score ?? "—"}
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  compliance score
                </span>
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Valid +10 · Expiring soon +5 · Expired −15 · Missing −25
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Upload artifact
              </h2>
              <form
                onSubmit={onUpload}
                className="grid max-w-2xl gap-3 sm:grid-cols-2"
              >
                <select
                  name="type"
                  className="rounded border border-zinc-300 px-3 py-2 text-sm"
                  defaultValue="insurance"
                >
                  <option value="insurance">Insurance</option>
                  <option value="wcb">WCB</option>
                  <option value="cor">COR</option>
                  <option value="scsa">SCSA</option>
                  <option value="custom">Custom</option>
                </select>
                <input
                  name="label"
                  placeholder="Label (optional)"
                  className="rounded border border-zinc-300 px-3 py-2 text-sm"
                />
                <input
                  name="fileUrl"
                  required
                  placeholder="File URL"
                  className="rounded border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
                />
                <input
                  name="expiryDate"
                  type="date"
                  className="rounded border border-zinc-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded bg-zinc-900 px-3 py-2 text-sm text-white"
                >
                  Upload
                </button>
              </form>
            </section>

            {reminders.length > 0 ? (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Renewal reminders
                </h2>
                <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white text-sm">
                  {reminders.map((r) => (
                    <li key={`${r.artifactId}-${r.kind}`} className="px-4 py-2">
                      <span className="font-mono text-xs">{r.type}</span> —{" "}
                      {r.kind.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Artifacts
              </h2>
              <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white text-sm">
                {artifacts.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">
                        {a.type}
                        {a.label ? ` — ${a.label}` : ""}
                      </p>
                      <p className="font-mono text-xs text-zinc-500">
                        {a.status}
                        {a.expiryDate
                          ? ` · expires ${new Date(a.expiryDate).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>
                    <a
                      href={a.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      File
                    </a>
                  </li>
                ))}
                {artifacts.length === 0 ? (
                  <li className="px-4 py-6 text-zinc-500">No artifacts yet.</li>
                ) : null}
              </ul>
            </section>
          </div>
        ) : null}

        {mode === "hiring" ? (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Hiring client review panel
            </h2>
            <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white text-sm">
              {pending.map((a) => (
                <li key={a.id} className="space-y-2 px-4 py-3">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {a.organization.name} · {a.type}
                      </p>
                      <p className="text-zinc-600">
                        {a.label || "No label"} · pending review
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onReview(a.id, "approve")}
                        className="rounded bg-emerald-800 px-3 py-1.5 text-white"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => onReview(a.id, "reject")}
                        className="rounded border border-zinc-300 px-3 py-1.5"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    View file
                  </a>
                </li>
              ))}
              {pending.length === 0 ? (
                <li className="px-4 py-6 text-zinc-500">
                  No artifacts pending review.
                </li>
              ) : null}
            </ul>
          </section>
        ) : null}
      </PageLayout>
    </ContentContainer>
  );
}

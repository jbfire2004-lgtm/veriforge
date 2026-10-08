"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createIncidentCapa,
  fetchIncidentInvestigation,
  generateIncidentAiPack,
  openIncidentInvestigation,
} from "@/lib/safety-intelligence";
import {
  SfButton,
  SfCard,
  SfFloatingInput,
  SfFloatingTextarea,
  SfSection,
} from "@/src/components/safety-forms/ui";

export default function IncidentInvestigationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const incidentId = parseInt(String(params?.id ?? ""), 10);
  const initialProjectId = searchParams?.get("projectId") ?? "1";

  const [projectId, setProjectId] = useState(initialProjectId);
  const [narrative, setNarrative] = useState("");
  const [ownerCompanyId, setOwnerCompanyId] = useState("1");
  const [investigation, setInvestigation] = useState<Awaited<
    ReturnType<typeof fetchIncidentInvestigation>
  > | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setInvestigation(await fetchIncidentInvestigation(incidentId));
    } catch {
      setInvestigation(null);
    }
  }

  useEffect(() => {
    if (incidentId) void load();
  }, [incidentId]);

  async function openInv(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await openIncidentInvestigation(incidentId, {
        projectId: Number(projectId),
        narrative,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function runAi() {
    setBusy(true);
    try {
      await generateIncidentAiPack(incidentId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI pack failed");
    } finally {
      setBusy(false);
    }
  }

  async function createCapaFromAi() {
    const pack = investigation?.aiInvestigationPack;
    if (!pack?.capaSuggestions?.length) return;
    setBusy(true);
    try {
      await createIncidentCapa(
        incidentId,
        pack.capaSuggestions.map((c) => ({
          title: c.title,
          description: c.description,
          ownerCompanyId: Number(ownerCompanyId),
          actionType: c.actionType,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "CAPA create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold">
          Incident investigation #{incidentId}
        </h1>
        {investigation?.incident && (
          <p className="text-sm text-[var(--sf-text-muted)]">
            {investigation.incident.title} · {investigation.incident.severity}
          </p>
        )}
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!investigation && (
        <SfCard className="p-6">
          <form className="space-y-4" onSubmit={(e) => void openInv(e)}>
            <SfFloatingInput
              label="Project ID"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            />
            <SfFloatingTextarea
              label="Narrative"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
            />
            <SfButton type="submit" disabled={busy}>
              Open investigation
            </SfButton>
          </form>
        </SfCard>
      )}

      {investigation && (
        <>
          <SfCard className="p-6 space-y-4">
            <p className="text-sm">
              Status: <strong>{investigation.investigationStatus}</strong>
            </p>
            {investigation.narrative && (
              <SfSection title="Narrative">
                <p className="text-sm">{investigation.narrative}</p>
              </SfSection>
            )}
            <SfButton type="button" variant="secondary" disabled={busy} onClick={() => void runAi()}>
              Generate AI investigation pack
            </SfButton>
          </SfCard>

          {investigation.aiInvestigationPack && (
            <SfCard className="space-y-6 p-6">
              <SfSection title="AI summary">
                <p className="text-sm">{investigation.aiInvestigationPack.summary}</p>
              </SfSection>
              {investigation.aiInvestigationPack.rootCauses?.length ? (
                <SfSection title="Suggested root causes">
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {investigation.aiInvestigationPack.rootCauses.map((r, i) => (
                      <li key={i}>
                        <strong>{r.category}</strong> — {r.description}
                      </li>
                    ))}
                  </ul>
                </SfSection>
              ) : null}
              {investigation.aiInvestigationPack.capaSuggestions?.length ? (
                <SfSection title="Suggested CAPAs">
                  <ul className="space-y-2 text-sm">
                    {investigation.aiInvestigationPack.capaSuggestions.map((c, i) => (
                      <li key={i} className="rounded-lg border border-[var(--sf-border)] p-3">
                        <p className="font-medium">{c.title}</p>
                        <p className="text-[var(--sf-text-muted)]">{c.description}</p>
                      </li>
                    ))}
                  </ul>
                  <SfFloatingInput
                    className="mt-4 max-w-[160px]"
                    label="Owner company ID"
                    value={ownerCompanyId}
                    onChange={(e) => setOwnerCompanyId(e.target.value)}
                  />
                  <SfButton
                    className="mt-4"
                    type="button"
                    disabled={busy}
                    onClick={() => void createCapaFromAi()}
                  >
                    Create CAIL entries from suggestions
                  </SfButton>
                </SfSection>
              ) : null}
            </SfCard>
          )}
        </>
      )}
    </div>
  );
}

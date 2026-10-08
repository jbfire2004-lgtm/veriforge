"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addPmIncidentInjury,
  createPmIncidentDraft,
  submitPmIncident,
  updatePmIncident,
} from "@/lib/pm-incidents";
import {
  evaluateDangerousOccurrence,
  type DangerousOccurrenceAssessmentDto,
} from "@/lib/dangerous-occurrence";
import { SfButton, SfCard } from "@/src/components/safety-forms/ui";

const EVENT_TYPES = [
  { value: "near_miss", label: "Near miss" },
  { value: "incident_injury", label: "Injury incident" },
  { value: "hazard_observation", label: "Hazard observation" },
  { value: "positive_observation", label: "Positive observation" },
  { value: "equipment_failure", label: "Equipment failure" },
  { value: "behavioral_observation", label: "Behavioral observation" },
];

const REGIONS = [
  { id: "CA-SK", label: "Saskatchewan OHS" },
  { id: "CA-AB", label: "Alberta OHS" },
  { id: "CA-BC", label: "WorkSafeBC" },
  { id: "CA-MB", label: "Manitoba WSH" },
  { id: "CA-ON", label: "Ontario OHSA" },
];

export default function PmIncidentWizardPage({
  projectId = 1,
  companyId = 1,
}: {
  projectId?: number;
  companyId?: number;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [eventId, setEventId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("near_miss");
  const [locationNote, setLocationNote] = useState("");
  const [regionCode, setRegionCode] = useState("CA-SK");
  const [medicalAid, setMedicalAid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ohs, setOhs] = useState<DangerousOccurrenceAssessmentDto | null>(null);

  useEffect(() => {
    const text = [title, description, locationNote].filter(Boolean).join(" ");
    if (text.trim().length < 8) {
      setOhs(null);
      return;
    }
    const handle = window.setTimeout(() => {
      void evaluateDangerousOccurrence({
        title,
        description,
        text: locationNote,
        regionCode,
      })
        .then(setOhs)
        .catch(() => setOhs(null));
    }, 400);
    return () => window.clearTimeout(handle);
  }, [title, description, locationNote, regionCode]);

  async function nextStep() {
    setLoading(true);
    try {
      if (step === 1 && !eventId) {
        const row = await createPmIncidentDraft({
          companyId,
          projectId,
          title: title || "Safety event",
          description,
          eventType,
          regionCode,
        });
        setEventId(row.id);
        const maybeDo = (
          row as PmSafetyEventWithDo
        ).dangerousOccurrence;
        if (maybeDo) setOhs(maybeDo);
        setStep(2);
      } else if (step === 2 && eventId) {
        await updatePmIncident(eventId, {
          locationNote,
          intakeWizardStep: 3,
          description,
        });
        setStep(3);
      } else if (step === 3 && eventId && medicalAid) {
        await addPmIncidentInjury(eventId, {
          medicalAid: true,
          firstAid: !medicalAid,
        });
        setStep(4);
      } else if (step === 3 && eventId) {
        setStep(4);
      } else if (step === 4 && eventId) {
        await submitPmIncident(eventId);
        router.push(`/pm/incidents/${eventId}?projectId=${projectId}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Event intake wizard</h1>
          <p className="text-sm text-[var(--sf-text-muted)]">Step {step} of 4</p>
        </div>
        <Link
          href={`/pm/emergency-response/quick?projectId=${projectId}&companyId=${companyId}`}
          className="text-xs font-semibold underline"
        >
          Emergency quick access
        </Link>
      </div>

      <SfCard className="space-y-4 p-5">
        {step === 1 ? (
          <>
            <label className="block text-sm font-medium">Jurisdiction</label>
            <select
              className="w-full rounded border px-2 py-1 text-sm"
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium">Event type</label>
            <select
              className="w-full rounded border px-2 py-1 text-sm"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium">Title</label>
            <input
              className="w-full rounded border px-2 py-1 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label className="block text-sm font-medium">What happened?</label>
            <textarea
              className="w-full rounded border px-2 py-1 text-sm"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <label className="block text-sm font-medium">Location</label>
            <input
              className="w-full rounded border px-2 py-1 text-sm"
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={medicalAid}
                onChange={(e) => setMedicalAid(e.target.checked)}
              />
              Medical aid required
            </label>
          </>
        ) : null}

        {step === 4 ? (
          <p className="text-sm">
            Review and submit. Severity and SIF/HECA scoring run on submit.
          </p>
        ) : null}

        {ohs?.flagged ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-950">
            <p className="font-semibold">
              {ohs.mustReportAny ? "OHS reporting required — " : "OHS flag — "}
              {ohs.framework.frameworkLabel}
            </p>
            <p className="mt-1 text-xs">{ohs.narrative}</p>
            <ul className="mt-2 space-y-2">
              {ohs.requiredReporting.map((r) => (
                <li
                  key={r.code}
                  className="rounded border border-amber-200 bg-white/70 px-2 py-2"
                >
                  <p className="text-xs font-medium">
                    {r.mustReport ? "REQUIRED · " : ""}
                    {r.label}
                    <span className="ml-2 uppercase opacity-70">
                      {r.urgency.replace(/_/g, " ")}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px]">{r.guidance}</p>
                </li>
              ))}
            </ul>
            {ohs.contactRouting && ohs.contactRouting.contacts.length > 0 ? (
              <div className="mt-3 border-t border-amber-200 pt-2">
                <p className="text-xs font-semibold">Hazard contact routing</p>
                <ul className="mt-1 space-y-1">
                  {ohs.contactRouting.contacts.map((c) => (
                    <li key={c.id} className="text-[11px]">
                      {c.reason}
                      {c.phone ? (
                        <>
                          {" "}
                          —{" "}
                          <a
                            className="font-bold text-red-700"
                            href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                          >
                            {c.phone}
                          </a>
                        </>
                      ) : (
                        <> — {c.dialHint}</>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-2 text-[10px] text-amber-900/70">{ohs.disclaimer}</p>
          </div>
        ) : null}

        <SfButton type="button" disabled={loading} onClick={() => void nextStep()}>
          {step === 4 ? "Submit event" : "Continue"}
        </SfButton>
      </SfCard>
    </div>
  );
}

type PmSafetyEventWithDo = {
  id: string;
  dangerousOccurrence?: DangerousOccurrenceAssessmentDto;
};

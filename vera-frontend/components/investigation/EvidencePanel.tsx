"use client";

import { useRef, useState } from "react";
import {
  addPmIncidentAttachment,
  addPmIncidentWitness,
  addPmIncidentStatement,
  addPmIncidentContributingFactor,
  type PmSafetyEvent,
} from "@/lib/pm-incidents";
import { Button } from "@/components/ui/button";
import { VS_COLORS } from "@/lib/verisuite-intelligence-ui/tokens";

type Props = {
  event: PmSafetyEvent;
  onUpdate: () => void;
};

export function EvidencePanel({ event, onUpdate }: Props) {
  const [witnessName, setWitnessName] = useState("");
  const [witnessContact, setWitnessContact] = useState("");
  const [selectedWitnessId, setSelectedWitnessId] = useState("");
  const [statementText, setStatementText] = useState("");
  const [trainingCourse, setTrainingCourse] = useState("");
  const [trainingWorker, setTrainingWorker] = useState("");
  const [trainingDate, setTrainingDate] = useState("");
  const [trainingNotes, setTrainingNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function withBusy(fn: () => Promise<void>) {
    setBusy(true);
    setMessage(null);
    try {
      await fn();
      onUpdate();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Evidence update failed");
    } finally {
      setBusy(false);
    }
  }

  async function handlePhotoUpload(file: File) {
    await withBusy(async () => {
      const dataUrl = await readAsDataUrl(file);
      await addPmIncidentAttachment(event.id, {
        dataUrl,
        fileName: file.name,
        mimeType: file.type,
        clientSyncId: `att-${Date.now()}`,
      });
    });
  }

  return (
    <div className="space-y-4">
      <div className="vs-panel space-y-3 p-4">
        <div>
          <p className="vs-eyebrow">Photos & documents</p>
          <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
            Scene photos, permits, JHA/FLHA copies, equipment logs, CCTV stills,
            and supporting documents.
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,.pdf,.docx,.xlsx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handlePhotoUpload(f);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? "Uploading…" : "+ Add photo / document"}
        </Button>
        {event.attachments?.length ? (
          <ul className="mt-2 space-y-2">
            {event.attachments.map((a) => (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded border px-3 py-2"
                style={{ borderColor: VS_COLORS.border }}
              >
                {a.mimeType?.startsWith("image/") && a.dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.dataUrl}
                    alt={a.fileName ?? "evidence"}
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <span style={{ color: VS_COLORS.blue }}>📎</span>
                )}
                <span className="text-sm" style={{ color: VS_COLORS.white }}>
                  {a.fileName ?? "Evidence"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="vs-panel space-y-3 p-4">
        <div>
          <p className="vs-eyebrow">Witnesses</p>
          <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
            Interview involved persons and observers separately. Capture facts,
            not blame.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className="rounded border bg-transparent px-3 py-2 text-sm"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            placeholder="Witness name"
            value={witnessName}
            onChange={(e) => setWitnessName(e.target.value)}
          />
          <input
            className="rounded border bg-transparent px-3 py-2 text-sm"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            placeholder="Contact (optional)"
            value={witnessContact}
            onChange={(e) => setWitnessContact(e.target.value)}
          />
        </div>
        <Button
          type="button"
          size="sm"
          disabled={busy || !witnessName.trim()}
          onClick={() =>
            void withBusy(async () => {
              await addPmIncidentWitness(event.id, {
                name: witnessName.trim(),
                contact: witnessContact.trim() || undefined,
              });
              setWitnessName("");
              setWitnessContact("");
            })
          }
        >
          Add witness
        </Button>
        {event.witnesses?.length ? (
          <ul className="space-y-2">
            {event.witnesses.map((w) => (
              <li
                key={w.id}
                className="rounded border px-3 py-2 text-sm"
                style={{ borderColor: VS_COLORS.border }}
              >
                <p style={{ color: VS_COLORS.white }}>{w.name}</p>
                {w.statements?.map((s) => (
                  <p
                    key={s.id}
                    className="mt-1 text-xs"
                    style={{ color: VS_COLORS.muted }}
                  >
                    “{s.statementText}”
                  </p>
                ))}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="vs-panel space-y-3 p-4">
        <p className="vs-eyebrow">Witness / involved-person statements</p>
        {event.witnesses?.length ? (
          <select
            className="block w-full max-w-xs rounded border bg-transparent px-3 py-2 text-sm"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            value={selectedWitnessId}
            onChange={(e) => setSelectedWitnessId(e.target.value)}
          >
            <option value="">— No specific witness —</option>
            {event.witnesses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        ) : null}
        <textarea
          className="min-h-[96px] w-full rounded border bg-transparent px-3 py-2 text-sm"
          style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          placeholder="Record statement verbatim…"
          value={statementText}
          onChange={(e) => setStatementText(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          disabled={busy || !statementText.trim()}
          onClick={() =>
            void withBusy(async () => {
              await addPmIncidentStatement(event.id, {
                witnessId: selectedWitnessId || undefined,
                statementText: statementText.trim(),
                clientSyncId: `stmt-${Date.now()}`,
              });
              setStatementText("");
            })
          }
        >
          Save statement
        </Button>
      </div>

      <div className="vs-panel space-y-3 p-4">
        <div>
          <p className="vs-eyebrow">Training & competency evidence</p>
          <p className="mt-1 text-xs" style={{ color: VS_COLORS.muted }}>
            Record completed training, tickets, orientations, and competency
            gaps relevant to this event (Intelex / ISN style).
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            className="rounded border bg-transparent px-3 py-2 text-sm"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            placeholder="Course / ticket name"
            value={trainingCourse}
            onChange={(e) => setTrainingCourse(e.target.value)}
          />
          <input
            className="rounded border bg-transparent px-3 py-2 text-sm"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            placeholder="Worker / role"
            value={trainingWorker}
            onChange={(e) => setTrainingWorker(e.target.value)}
          />
          <input
            type="date"
            className="rounded border bg-transparent px-3 py-2 text-sm"
            style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
            value={trainingDate}
            onChange={(e) => setTrainingDate(e.target.value)}
          />
        </div>
        <textarea
          className="min-h-[72px] w-full rounded border bg-transparent px-3 py-2 text-sm"
          style={{ borderColor: VS_COLORS.border, color: VS_COLORS.white }}
          placeholder="Notes — completed / expired / gap identified…"
          value={trainingNotes}
          onChange={(e) => setTrainingNotes(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          disabled={busy || !trainingCourse.trim()}
          onClick={() =>
            void withBusy(async () => {
              const label = [
                trainingCourse.trim(),
                trainingWorker.trim() ? `— ${trainingWorker.trim()}` : "",
                trainingDate ? `(${trainingDate})` : "",
              ]
                .filter(Boolean)
                .join(" ");
              await addPmIncidentContributingFactor(event.id, {
                label,
                category: "training",
                notes: trainingNotes.trim() || undefined,
              });
              await addPmIncidentStatement(event.id, {
                statementText: `[Training record] ${label}${
                  trainingNotes.trim() ? `: ${trainingNotes.trim()}` : ""
                }`,
                clientSyncId: `train-${Date.now()}`,
              });
              setTrainingCourse("");
              setTrainingWorker("");
              setTrainingDate("");
              setTrainingNotes("");
            })
          }
        >
          Log training evidence
        </Button>
        {event.contributingFactors?.filter((f) => f.category === "training")
          .length ? (
          <ul className="space-y-1 text-sm" style={{ color: VS_COLORS.muted }}>
            {event.contributingFactors
              .filter((f) => f.category === "training")
              .map((f) => (
                <li key={f.id}>• {f.label}</li>
              ))}
          </ul>
        ) : null}
      </div>

      {message ? (
        <p className="text-xs" style={{ color: VS_COLORS.orange }}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

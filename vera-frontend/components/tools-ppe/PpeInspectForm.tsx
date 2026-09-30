"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { inspectPpe } from "@/lib/api/tools-ppe";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";

const CHECKLIST_BY_TYPE: Record<string, { id: string; label: string }[]> = {
  HARD_HAT: [
    { id: "shell", label: "Shell free of cracks / dents" },
    { id: "suspension", label: "Suspension / straps intact" },
    { id: "date", label: "Within service life" },
  ],
  SAFETY_GLASSES: [
    { id: "lenses", label: "Lenses clear, unscratched" },
    { id: "fit", label: "Fit / side shields OK" },
  ],
  GLOVES: [
    { id: "integrity", label: "No tears or holes" },
    { id: "task_fit", label: "Correct type for task" },
  ],
  HARNESS: [
    { id: "webbing", label: "Webbing free of cuts / fray" },
    { id: "hardware", label: "Hardware / labels serviceable" },
    { id: "stitching", label: "Stitching intact" },
  ],
  FOOTWEAR: [
    { id: "sole", label: "Sole / tread serviceable" },
    { id: "toe", label: "Toe protection intact" },
  ],
  HEARING: [
    { id: "fit", label: "Fit and seal OK" },
    { id: "condition", label: "Cups / plugs undamaged" },
  ],
  RESPIRATOR: [
    { id: "seal", label: "Face seal intact" },
    { id: "filter", label: "Filter / cartridge current" },
  ],
  COVERALL: [
    { id: "fabric", label: "Fabric undamaged" },
    { id: "closures", label: "Closures work" },
  ],
  OTHER: [{ id: "condition", label: "Overall condition acceptable" }],
};

export function PpeInspectForm({
  ppeId,
  workerId,
  ppeType = "OTHER",
}: {
  ppeId: number;
  workerId?: number;
  ppeType?: string;
}) {
  const router = useRouter();
  const defs = useMemo(
    () => CHECKLIST_BY_TYPE[ppeType] ?? CHECKLIST_BY_TYPE.OTHER,
    [ppeType],
  );
  const [itemPass, setItemPass] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(defs.map((d) => [d.id, true])),
  );
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passed = Object.values(itemPass).every(Boolean);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const checklist = Object.fromEntries(
        defs.map((d) => [d.id, { label: d.label, passed: !!itemPass[d.id] }]),
      );
      await inspectPpe(ppeId, {
        passed,
        checklist: { items: checklist, overall: { passed } },
        notes: notes || undefined,
        workerId,
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inspection failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>PPE asset inspection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Serialized inventory check for {ppeType.replaceAll("_", " ").toLowerCase()}.
            For daily personal kit checks use{" "}
            <a className="underline" href="/pm/inspections/ppe-preuse/new">
              PPE pre-use
            </a>
            .
          </p>
          <ul className="space-y-3">
            {defs.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>{d.label}</span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={itemPass[d.id] ? "teal" : "outline"}
                    onClick={() =>
                      setItemPass((prev) => ({ ...prev, [d.id]: true }))
                    }
                  >
                    Pass
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={!itemPass[d.id] ? "danger" : "outline"}
                    onClick={() =>
                      setItemPass((prev) => ({ ...prev, [d.id]: false }))
                    }
                  >
                    Fail
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Overall: {passed ? "Pass — extend expiry" : "Fail — retire"}
          </p>
          <section>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </section>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="teal" disabled={busy}>
            {busy ? "Saving…" : "Submit inspection"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

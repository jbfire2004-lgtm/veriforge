"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inspectTool } from "@/lib/api/tools-ppe";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";

type Item = { id: string; label: string; required?: boolean };

export function ToolInspectForm({
  toolId,
  items,
  workerId,
}: {
  toolId: number;
  items: Item[];
  workerId?: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, boolean>>(
    () => Object.fromEntries(items.map((i) => [i.id, true])),
  );
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passed = items.every((i) => !i.required || answers[i.id] !== false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const checklist = Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [k, { passed: v }]),
      );
      await inspectTool(toolId, { passed, checklist, notes: notes || undefined, workerId });
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
          <CardTitle>Tool inspection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <section key={item.id} className="flex items-center justify-between gap-2 border-b pb-2">
              <Label className="font-normal">{item.label}</Label>
              <section className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={answers[item.id] ? "teal" : "outline"}
                  onClick={() => setAnswers((a) => ({ ...a, [item.id]: true }))}
                >
                  Pass
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={answers[item.id] === false ? "danger" : "outline"}
                  onClick={() => setAnswers((a) => ({ ...a, [item.id]: false }))}
                >
                  Fail
                </Button>
              </section>
            </section>
          ))}
          <section>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </section>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="teal" disabled={busy}>
            {busy ? "Saving…" : passed ? "Submit — pass" : "Submit — fail"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

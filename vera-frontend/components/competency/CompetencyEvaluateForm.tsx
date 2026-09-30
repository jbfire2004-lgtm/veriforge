"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { evaluateCompetency, checkCompetency } from "@/lib/api/competency";
import { Button, Card, CardContent, Input, Label, Select } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

type Props = {
  workers: { id: number; firstName: string; lastName: string }[];
  equipment: { id: number; name: string }[];
  redirectTo?: string;
};

export function CompetencyEvaluateForm({ workers, equipment, redirectTo }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [workerId, setWorkerId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [score, setScore] = useState("80");
  const [passed, setPassed] = useState("true");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);

  async function onCheck() {
    if (!workerId || !equipmentId) return;
    setBusy(true);
    try {
      const res = await checkCompetency(Number(workerId), Number(equipmentId));
      setCheckResult(
        res.eligible
          ? `Eligible (min score ${res.minPassingScore})`
          : res.reason ?? "Not eligible",
      );
    } catch {
      setCheckResult("Check failed");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workerId || !equipmentId) return;
    setBusy(true);
    try {
      await evaluateCompetency({
        workerId: Number(workerId),
        equipmentId: Number(equipmentId),
        score: Number(score),
        passed: passed === "true",
        notes: notes.trim() || undefined,
      });
      toast({ title: "Evaluation saved", variant: "success" });
      router.push(redirectTo ?? "/admin/competency");
      router.refresh();
    } catch (err) {
      toast({
        title: "Evaluation failed",
        description: err instanceof Error ? err.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="mx-auto flex max-w-lg flex-col gap-4">
          <div>
            <Label htmlFor="worker">Worker</Label>
            <Select id="worker" value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
              <option value="">Select worker</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.firstName} {w.lastName}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="equipment">Equipment</Label>
            <Select
              id="equipment"
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
            >
              <option value="">Select equipment</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="score">Score (0–100)</Label>
              <Input
                id="score"
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="passed">Result</Label>
              <Select id="passed" value={passed} onChange={(e) => setPassed(e.target.value)}>
                <option value="true">Pass</option>
                <option value="false">Fail</option>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {checkResult ? (
            <p className="rounded-lg bg-vera-charcoal/5 px-3 py-2 text-sm">{checkResult}</p>
          ) : null}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" disabled={busy} onClick={() => void onCheck()}>
              Pre-check
            </Button>
            <Button type="submit" variant="teal" disabled={busy}>
              Save evaluation
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

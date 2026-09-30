"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertEquipmentCompetencyRequirements } from "@/lib/api/competency";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

type Resolved = {
  minPassingScore: number;
  expiryDays: number | null;
  requireEvaluation: boolean;
  source: string;
};

type Props = {
  equipmentId: number;
  resolved: Resolved;
};

export function EquipmentCompetencyRequirements({ equipmentId, resolved }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [minScore, setMinScore] = useState(String(resolved.minPassingScore));
  const [expiryDays, setExpiryDays] = useState(
    resolved.expiryDays != null ? String(resolved.expiryDays) : "",
  );
  const [requireEval, setRequireEval] = useState(
    resolved.requireEvaluation ? "true" : "false",
  );
  const [busy, setBusy] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await upsertEquipmentCompetencyRequirements(equipmentId, {
        minPassingScore: Number(minScore),
        expiryDays: expiryDays ? Number(expiryDays) : null,
        requireEvaluation: requireEval === "true",
      });
      toast({ title: "Requirements saved", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Save failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Competency requirements</CardTitle>
        <p className="text-sm text-vera-muted">
          Active rules: {resolved.source} · min {resolved.minPassingScore}% ·{" "}
          {resolved.expiryDays ?? "no"} day expiry
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSave} className="flex max-w-md flex-col gap-4">
          <section>
            <Label htmlFor="minScore">Minimum passing score</Label>
            <Input
              id="minScore"
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
            />
          </section>
          <section>
            <Label htmlFor="expiry">Expiry (days, blank = never)</Label>
            <Input
              id="expiry"
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
            />
          </section>
          <section>
            <Label htmlFor="require">Require evaluation</Label>
            <Select
              id="require"
              value={requireEval}
              onChange={(e) => setRequireEval(e.target.value)}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </section>
          <Button type="submit" variant="teal" disabled={busy}>
            Save asset requirements
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

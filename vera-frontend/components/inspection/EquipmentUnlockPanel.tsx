"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unlockEquipmentAfterInspection } from "@/lib/api/inspection";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";

type Props = {
  equipmentId: number;
  lockedOut: boolean;
  lockoutReason?: string | null;
};

export function EquipmentUnlockPanel({ equipmentId, lockedOut, lockoutReason }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!lockedOut) return null;

  async function onUnlock() {
    setLoading(true);
    setError(null);
    try {
      await unlockEquipmentAfterInspection(equipmentId, notes || undefined);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Equipment locked out</CardTitle>
        {lockoutReason && (
          <p className="text-sm text-muted-foreground">{lockoutReason}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <section>
          <Label htmlFor="unlock-notes">Unlock notes (corrective action complete)</Label>
          <Input
            id="unlock-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Repairs verified by qualified person"
          />
        </section>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="button" variant="teal" disabled={loading} onClick={onUnlock}>
          {loading ? "Unlocking…" : "Unlock equipment"}
        </Button>
      </CardContent>
    </Card>
  );
}

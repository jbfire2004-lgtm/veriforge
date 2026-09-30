"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignPpeToWorker, assignToolToWorker } from "@/lib/api/tools-ppe";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";

export function AssignAssetForm({
  kind,
  assetId,
  projectId,
}: {
  kind: "tool" | "ppe";
  assetId: number;
  projectId?: number;
}) {
  const router = useRouter();
  const [workerId, setWorkerId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wid = Number(workerId);
    if (!wid) return;
    setBusy(true);
    setError(null);
    try {
      if (kind === "tool") {
        await assignToolToWorker(assetId, wid, projectId);
      } else {
        await assignPpeToWorker(assetId, wid, projectId);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assignment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign to worker</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <section>
            <Label htmlFor="workerId">Worker ID</Label>
            <Input
              id="workerId"
              type="number"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              required
            />
          </section>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="teal" disabled={busy}>
            {busy ? "Assigning…" : "Assign"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

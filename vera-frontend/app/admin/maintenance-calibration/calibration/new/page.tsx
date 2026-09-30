"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createCalibrationRecord } from "@/lib/api/maintenance-calibration";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button, Card, CardContent, Input, Label } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function NewCalibrationRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [equipmentId, setEquipmentId] = useState(
    () => searchParams?.get("equipmentId") ?? "",
  );
  const [certificateNumber, setCertificateNumber] = useState("");
  const [passed, setPassed] = useState(true);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createCalibrationRecord({
        equipmentId: Number(equipmentId),
        certificateNumber: certificateNumber || undefined,
        passed,
        notes: notes || undefined,
      });
      router.push("/admin/maintenance-calibration/calibration");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setBusy(false);
    }
  }

  return (
    <AdminPageShell
      title="Add calibration record"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "M&C", href: "/admin/maintenance-calibration" },
        { label: "Calibration", href: "/admin/maintenance-calibration/calibration" },
        { label: "New" },
      ]}
    >
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <section>
              <Label>Equipment ID</Label>
              <Input
                type="number"
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                required
              />
            </section>
            <section>
              <Label>Certificate #</Label>
              <Input
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
              />
            </section>
            <section className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={passed}
                  onChange={() => setPassed(true)}
                />
                Pass
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={!passed}
                  onChange={() => setPassed(false)}
                />
                Fail
              </label>
            </section>
            <section>
              <Label>Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </section>
            <p className="text-xs text-muted-foreground">
              On pass, expiry is auto-scheduled from the equipment calibration schedule (default 365 days).
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <section className="flex gap-2">
              <Button type="submit" variant="teal" disabled={busy}>
                {busy ? "Saving…" : "Save record"}
              </Button>
              <Link href="/admin/maintenance-calibration/calibration" className={buttonStyles({ variant: "outline" })}>
                Cancel
              </Link>
            </section>
          </form>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

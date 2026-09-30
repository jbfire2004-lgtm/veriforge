"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createMaintenanceRecord } from "@/lib/api/maintenance-calibration";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button, Card, CardContent, Input, Label, Select } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

const TYPES = ["PREVENTIVE", "CORRECTIVE", "SCHEDULED", "EMERGENCY"] as const;

export default function NewMaintenanceRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [equipmentId, setEquipmentId] = useState(
    () => searchParams?.get("equipmentId") ?? "",
  );
  const [type, setType] = useState<string>("PREVENTIVE");
  const [notes, setNotes] = useState("");
  const [meterHours, setMeterHours] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createMaintenanceRecord({
        equipmentId: Number(equipmentId),
        type,
        notes: notes || undefined,
        meterHours: meterHours ? Number(meterHours) : undefined,
      });
      router.push("/admin/maintenance-calibration/maintenance");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setBusy(false);
    }
  }

  return (
    <AdminPageShell
      title="Add maintenance record"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "M&C", href: "/admin/maintenance-calibration" },
        { label: "Maintenance", href: "/admin/maintenance-calibration/maintenance" },
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
              <Label>Type</Label>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </section>
            <section>
              <Label>Meter hours</Label>
              <Input
                type="number"
                step="0.1"
                value={meterHours}
                onChange={(e) => setMeterHours(e.target.value)}
              />
            </section>
            <section>
              <Label>Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </section>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <section className="flex gap-2">
              <Button type="submit" variant="teal" disabled={busy}>
                {busy ? "Saving…" : "Save record"}
              </Button>
              <Link href="/admin/maintenance-calibration/maintenance" className={buttonStyles({ variant: "outline" })}>
                Cancel
              </Link>
            </section>
          </form>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

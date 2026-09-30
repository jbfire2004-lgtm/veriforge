"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  lockoutEquipment,
  unlockEquipment,
  assignWorkerToEquipment,
  type EquipmentDetail,
  type TimelineEvent,
} from "@/lib/api/equipment-core";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Tab = "overview" | "compliance" | "operators" | "projects" | "history";

type Props = {
  equipment: EquipmentDetail;
  timeline: TimelineEvent[];
  companyWorkers?: { id: number; firstName: string; lastName: string }[];
};

export function EquipmentDetailTabs({
  equipment,
  timeline,
  companyWorkers = [],
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const { toast } = useToast();
  const router = useRouter();
  const [lockReason, setLockReason] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [busy, setBusy] = useState(false);

  const companyId =
    equipment.activeCompanyLink?.companyId ?? equipment.company?.id;

  async function onLockout() {
    if (!lockReason.trim()) return;
    setBusy(true);
    try {
      await lockoutEquipment(equipment.id, lockReason, companyId);
      toast({ title: "Equipment locked out", variant: "success" });
      router.refresh();
    } catch (e) {
      toast({
        title: "Lockout failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function onUnlock() {
    setBusy(true);
    try {
      await unlockEquipment(equipment.id);
      toast({ title: "Equipment unlocked", variant: "success" });
      router.refresh();
    } catch {
      toast({ title: "Unlock failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function onAssignWorker() {
    if (!workerId) return;
    setBusy(true);
    try {
      await assignWorkerToEquipment(equipment.id, Number(workerId), companyId);
      toast({ title: "Operator assigned", variant: "success" });
      router.refresh();
    } catch (e) {
      toast({
        title: "Assign failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "compliance", label: "Compliance" },
    { id: "operators", label: "Operators" },
    { id: "projects", label: "Projects" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="space-y-4">
      
        <div className="flex flex-wrap gap-2 border-b border-vera-charcoal/10 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                tab === t.id
                  ? buttonStyles({ variant: "teal", size: "sm" })
                  : buttonStyles({ variant: "ghost", size: "sm" })
              }
            >
              {t.label}
            </button>
          ))}
          <Link
            href={`/admin/equipment/${equipment.id}/qr`}
            className={buttonStyles({ variant: "outline", size: "sm", className: "ml-auto" })}
          >
            QR code
          </Link>
        <Link
          href={`/admin/equipment/${equipment.id}/assign-project`}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          Assign project
        </Link>
        <Link
          href={`/admin/equipment/${equipment.id}/competency`}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          Competency
        </Link>
        </div>

      {tab === "overview" ? (
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
            <Field label="Serial" value={equipment.serialNumber ?? "—"} />
            <Field label="Asset tag" value={equipment.assetTag ?? "—"} />
            <Field label="Meter hours" value={String(equipment.meterHours ?? 0)} />
            <Field label="Manufacturer" value={equipment.manufacturer ?? "—"} />
            <div className="sm:col-span-2">
              {equipment.isLockedOut ? (
                <Button variant="secondary" disabled={busy} onClick={() => void onUnlock()}>
                  Unlock equipment
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lock-reason">Lockout reason</Label>
                  <Input
                    id="lock-reason"
                    value={lockReason}
                    onChange={(e) => setLockReason(e.target.value)}
                  />
                  <Button
                    variant="destructive"
                    disabled={busy}
                    onClick={() => void onLockout()}
                  >
                    Lock out equipment
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "compliance" ? (
        <Card>
          <CardHeader>
            <CardTitle>Compliance status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge
              variant={
                equipment.activeCompanyLink?.complianceStatus === "COMPLIANT"
                  ? "success"
                  : "danger"
              }
            >
              {equipment.activeCompanyLink?.complianceStatus ?? "Unknown"}
            </Badge>
            <ul className="space-y-2 text-sm">
              {(equipment.complianceHistory ?? []).map((c, i) => (
                <li key={i} className="rounded-lg border border-vera-charcoal/10 px-3 py-2">
                  <span className="font-medium">{c.status}</span>
                  <span className="text-vera-muted">
                    {" · "}
                    {new Date(c.assessedAt).toLocaleString()}
                  </span>
                  {c.notes ? <p className="text-vera-muted">{c.notes}</p> : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {tab === "operators" ? (
        <Card>
          <CardHeader>
            <CardTitle>Assigned operators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {(equipment.assignedOperators ?? []).map((op) => (
                <li key={op.worker.id}>
                  <Link
                    href={`/admin/workers/${op.worker.id}`}
                    className="text-vera-teal hover:underline"
                  >
                    {op.worker.firstName} {op.worker.lastName}
                  </Link>
                </li>
              ))}
            </ul>
            {companyWorkers.length > 0 ? (
              <div className="flex gap-2">
                <Select value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
                  <option value="">Add operator</option>
                  {companyWorkers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.firstName} {w.lastName}
                    </option>
                  ))}
                </Select>
                <Button variant="teal" disabled={busy} onClick={() => void onAssignWorker()}>
                  Assign
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {tab === "projects" ? (
        <Card>
          <CardHeader>
            <CardTitle>Active projects</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(equipment.projectAssignments ?? []).map((pa, i) => (
                <li key={i}>{pa.project?.name ?? "Project"}</li>
              ))}
              {(equipment.projectAssignments ?? []).length === 0 ? (
                <p className="text-vera-muted">Not assigned to a project.</p>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {tab === "history" ? (
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative border-l border-vera-charcoal/20 pl-6">
              {timeline.map((ev, i) => (
                <li key={i} className="mb-6">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-vera-teal" />
                  <p className="text-sm font-medium text-vera-charcoal">{ev.title}</p>
                  <p className="text-xs text-vera-muted">
                    {new Date(ev.at).toLocaleString()}
                    {ev.detail ? ` · ${ev.detail}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-vera-muted">{label}</p>
      <p>{value}</p>
    </div>
  );
}

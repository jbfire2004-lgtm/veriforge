"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HardHat } from "lucide-react";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { unknownToErrorMessage } from "@/lib/core";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type WorkerDto = {
  id: number;
  firstName: string;
  lastName: string;
  company?: { id: number; name: string } | null;
};

type EquipmentDto = {
  id: number;
  name: string;
  serialNumber?: string | null;
  isSafe?: boolean;
};

type AssignmentDto = {
  id: number;
  assignedAt: string;
  returnedAt?: string | null;
  equipment: EquipmentDto;
};

export default function WorkerEquipmentPage() {
  const params = useParams();
  const workerId = String(params?.id ?? "").trim();
  const { toast } = useToast();

  const [worker, setWorker] = useState<WorkerDto | null>(null);
  const [equipmentList, setEquipmentList] = useState<EquipmentDto[]>([]);
  const [assigned, setAssigned] = useState<AssignmentDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectError, setSelectError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);

  const loadData = useCallback(async () => {
    if (!workerId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [w, e, a] = await Promise.all([
        apiGet<WorkerDto>(`/workers/${workerId}`),
        apiGet<EquipmentDto[]>("/equipment"),
        apiGet<AssignmentDto[]>(`/equipment-assignments/worker/${workerId}`),
      ]);
      setWorker(w);
      setEquipmentList(Array.isArray(e) ? e : []);
      setAssigned(Array.isArray(a) ? a : []);
    } catch (err) {
      setLoadError(unknownToErrorMessage(err, "Failed to load equipment data"));
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function resetForm() {
    setSelectedEquipment("");
    setSelectError(null);
    setFormError(null);
  }

  async function assignEquipment(e: React.FormEvent) {
    e.preventDefault();
    if (mutating) return;

    if (!selectedEquipment) {
      setSelectError("Select equipment.");
      setFormError("Fix the highlighted fields.");
      return;
    }
    setSelectError(null);
    setFormError(null);

    const eq = equipmentList.find((x) => String(x.id) === selectedEquipment);

    setMutating(true);
    try {
      await apiPost("/equipment-assignments", {
        workerId: Number(workerId),
        equipmentId: Number(selectedEquipment),
      });
      toast({
        variant: "success",
        title: "Equipment assigned",
        description: eq ? eq.name : undefined,
      });
      resetForm();
      await loadData();
    } catch (err) {
      const msg = unknownToErrorMessage(err, "Failed to assign equipment");
      setFormError(msg);
      toast({ variant: "error", title: "Could not assign equipment", description: msg });
    } finally {
      setMutating(false);
    }
  }

  async function markReturned(assignmentId: number) {
    if (mutating) return;
    setMutating(true);
    try {
      await apiPatch(`/equipment-assignments/${assignmentId}/return`, {});
      toast({ variant: "success", title: "Marked returned" });
      await loadData();
    } catch (err) {
      const msg = unknownToErrorMessage(err, "Failed to mark returned");
      toast({ variant: "error", title: "Could not mark returned", description: msg });
    } finally {
      setMutating(false);
    }
  }

  const breadcrumbs = [
    { label: "Admin", href: "/admin" },
    { label: "Workers", href: "/admin/workers" },
    {
      label: worker ? `${worker.firstName} ${worker.lastName}` : `#${workerId}`,
      href: `/admin/workers/${workerId}`,
    },
    { label: "Equipment" },
  ];

  if (loading) {
    return (
      <AdminPageShell title="Equipment assignments" breadcrumbs={breadcrumbs}>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </AdminPageShell>
    );
  }

  if (loadError || !worker) {
    return (
      <AdminPageShell title="Equipment assignments" breadcrumbs={breadcrumbs}>
        <ErrorState
          title="Could not load equipment data"
          description={loadError ?? "Worker not found."}
        >
          <Link href="/admin/workers" className={buttonStyles({ variant: "outline", size: "md" })}>
            Back to workers
          </Link>
        </ErrorState>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Equipment assignments"
      description={`${worker.firstName} ${worker.lastName}`}
      breadcrumbs={breadcrumbs}
    >
      <Card className="border-vera-charcoal/10">
        <CardContent className="space-y-vera-2 p-vera-6 text-sm text-vera-muted">
          <p className="font-semibold text-vera-charcoal">
            {worker.firstName} {worker.lastName}
          </p>
          <p>ID: {worker.id}</p>
          <p>Company: {worker.company?.name ?? "—"}</p>
          <Link
            href={`/admin/workers/${worker.id}`}
            className={buttonStyles({ variant: "ghost", size: "sm", className: "px-0" })}
          >
            ← Back to worker profile
          </Link>
        </CardContent>
      </Card>

      <Card className="border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>Assign equipment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-vera-4">
          {formError ? <p className="text-sm font-medium text-red-600">{formError}</p> : null}
          <form onSubmit={assignEquipment} className="flex flex-col gap-vera-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-vera-2">
              <Select
                value={selectedEquipment}
                onChange={(e) => {
                  setSelectedEquipment(e.target.value);
                  if (e.target.value) setSelectError(null);
                }}
                aria-label="Equipment"
                aria-invalid={!!selectError}
                disabled={mutating}
              >
                <option value="">Select equipment</option>
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={String(eq.id)}>
                    {eq.name} — {eq.serialNumber ?? "No serial"}
                  </option>
                ))}
              </Select>
              {selectError ? <p className="text-sm text-red-600">{selectError}</p> : null}
            </div>
            <Button type="submit" variant="teal" disabled={mutating || equipmentList.length === 0}>
              {mutating ? "Working…" : "Assign"}
            </Button>
          </form>
          {equipmentList.length === 0 ? (
            <p className="text-sm text-vera-muted">No equipment registered yet.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>Currently assigned</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-vera-6">
          {assigned.length === 0 ? (
            <div className="p-vera-6">
              <EmptyState
                icon={HardHat}
                title="No equipment assigned"
                description="Use the form above to issue equipment to this worker."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Safety</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assigned.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.equipment?.name ?? "—"}</TableCell>
                    <TableCell className={a.equipment?.isSafe ? "text-emerald-700" : "text-red-600"}>
                      {a.equipment?.isSafe ? "Safe" : "Unsafe"}
                    </TableCell>
                    <TableCell className="text-xs text-vera-muted">
                      <div>Assigned {new Date(a.assignedAt).toLocaleDateString()}</div>
                      {a.returnedAt ? <div>Returned {new Date(a.returnedAt).toLocaleDateString()}</div> : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-vera-2">
                        {!a.returnedAt ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => markReturned(a.id)}
                            disabled={mutating}
                          >
                            Mark returned
                          </Button>
                        ) : null}
                        {a.equipment ? (
                          <Link
                            href={`/admin/equipment/${a.equipment.id}`}
                            className={buttonStyles({ variant: "outline", size: "sm" })}
                          >
                            View
                          </Link>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

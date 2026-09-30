"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
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

type CertDto = {
  id: number;
  name: string;
  expiryDays?: number | null;
};

type TrainingDto = {
  id: number;
  isValid?: boolean;
  completedAt?: string | null;
  expiresAt?: string | null;
  certification: { id: number; name: string };
};

function toIsoStart(date: Date) {
  const ymd = date.toISOString().slice(0, 10);
  return new Date(`${ymd}T00:00:00.000Z`).toISOString();
}

function computeExpiry(issued: Date, expiryDays: number) {
  const ms = issued.getTime() + expiryDays * 24 * 60 * 60 * 1000;
  return toIsoStart(new Date(ms));
}

export default function WorkerTrainingPage() {
  const params = useParams();
  const workerId = String(params?.id ?? "").trim();
  const { toast } = useToast();

  const [worker, setWorker] = useState<WorkerDto | null>(null);
  const [certs, setCerts] = useState<CertDto[]>([]);
  const [records, setRecords] = useState<TrainingDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedCert, setSelectedCert] = useState("");
  const [selectError, setSelectError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!workerId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [w, c, t] = await Promise.all([
        apiGet<WorkerDto>(`/workers/${workerId}`),
        apiGet<CertDto[]>("/certifications"),
        apiGet<TrainingDto[]>(`/training-records/worker/${workerId}`),
      ]);
      setWorker(w);
      setCerts(Array.isArray(c) ? c : []);
      setRecords(Array.isArray(t) ? t : []);
    } catch (err) {
      setLoadError(unknownToErrorMessage(err, "Failed to load training data"));
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function resetForm() {
    setSelectedCert("");
    setSelectError(null);
    setFormError(null);
  }

  async function assignTraining(e: React.FormEvent) {
    e.preventDefault();
    if (mutating) return;

    if (!selectedCert) {
      setSelectError("Select a certification.");
      setFormError("Fix the highlighted fields.");
      return;
    }
    setSelectError(null);
    setFormError(null);

    const cert = certs.find((c) => String(c.id) === selectedCert);
    const issuedDate = new Date();
    const issuedIso = toIsoStart(issuedDate);
    const expiryDays = Number(cert?.expiryDays) > 0 ? Number(cert?.expiryDays) : 365;
    const expiresIso = computeExpiry(issuedDate, expiryDays);

    setMutating(true);
    try {
      await apiPost("/training-records", {
        workerId: Number(workerId),
        certificationId: Number(selectedCert),
        issuedAt: issuedIso,
        expiresAt: expiresIso,
      });
      toast({
        variant: "success",
        title: "Training assigned",
        description: cert ? cert.name : undefined,
      });
      resetForm();
      await loadData();
    } catch (err) {
      const msg = unknownToErrorMessage(err, "Failed to assign training");
      setFormError(msg);
      toast({ variant: "error", title: "Could not assign training", description: msg });
    } finally {
      setMutating(false);
    }
  }

  async function markComplete(recordId: number) {
    if (mutating) return;
    setMutating(true);
    try {
      await apiPatch(`/training-records/${recordId}/complete`, {});
      toast({ variant: "success", title: "Marked complete" });
      await loadData();
    } catch (err) {
      const msg = unknownToErrorMessage(err, "Failed to mark complete");
      toast({ variant: "error", title: "Could not mark complete", description: msg });
    } finally {
      setMutating(false);
    }
  }

  async function removeTraining(recordId: number) {
    if (mutating) return;
    setMutating(true);
    try {
      await apiDelete(`/training-records/${recordId}`);
      toast({ variant: "success", title: "Training removed" });
      await loadData();
    } catch (err) {
      const msg = unknownToErrorMessage(err, "Failed to remove training");
      toast({ variant: "error", title: "Could not remove training", description: msg });
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
    { label: "Training" },
  ];

  if (loading) {
    return (
      <AdminPageShell title="Training records" breadcrumbs={breadcrumbs}>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </AdminPageShell>
    );
  }

  if (loadError || !worker) {
    return (
      <AdminPageShell title="Training records" breadcrumbs={breadcrumbs}>
        <ErrorState
          title="Could not load training data"
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
      title="Training records"
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
          <CardTitle>Assign training</CardTitle>
        </CardHeader>
        <CardContent className="space-y-vera-4">
          {formError ? <p className="text-sm font-medium text-red-600">{formError}</p> : null}
          <form onSubmit={assignTraining} className="flex flex-col gap-vera-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-vera-2">
              <Select
                value={selectedCert}
                onChange={(e) => {
                  setSelectedCert(e.target.value);
                  if (e.target.value) setSelectError(null);
                }}
                aria-label="Certification"
                aria-invalid={!!selectError}
                disabled={mutating}
              >
                <option value="">Select certification</option>
                {certs.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </Select>
              {selectError ? <p className="text-sm text-red-600">{selectError}</p> : null}
            </div>
            <Button type="submit" variant="teal" disabled={mutating || certs.length === 0}>
              {mutating ? "Working…" : "Assign"}
            </Button>
          </form>
          {certs.length === 0 ? (
            <p className="text-sm text-vera-muted">No certification types defined yet.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>Current training</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-vera-6">
          {records.length === 0 ? (
            <div className="p-vera-6">
              <EmptyState
                icon={GraduationCap}
                title="No training records"
                description="Assign a certification above to begin tracking training for this worker."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="font-medium">{rec.certification?.name ?? "—"}</TableCell>
                    <TableCell className={rec.isValid ? "text-emerald-700" : "text-red-600"}>
                      {rec.isValid ? "Valid" : "Expired"}
                    </TableCell>
                    <TableCell className="text-vera-muted">
                      {rec.completedAt ? new Date(rec.completedAt).toLocaleDateString() : "Not completed"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-vera-2">
                        {!rec.completedAt ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => markComplete(rec.id)}
                            disabled={mutating}
                          >
                            Mark complete
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeTraining(rec.id)}
                          disabled={mutating}
                        >
                          Remove
                        </Button>
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

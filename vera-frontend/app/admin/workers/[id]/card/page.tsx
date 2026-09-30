"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { API_URL } from "@/lib/api-fetch";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button, Card, CardContent, CardTitle } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function WorkerCardPage() {
  const params = useParams();
  const id = String(params?.id ?? "");

  const [worker, setWorker] = useState<any>(null);
  const [qr, setQr] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const verifyUrl = typeof window !== "undefined" ? `${window.location.origin}/verify/${id}` : "";

  useEffect(() => {
    if (!id) return;

    async function load() {
      const workerRes = await fetch(`${API_URL}/workers/${id}`);
      const workerData = await workerRes.json();
      setWorker(workerData);

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const qrData = await QRCode.toDataURL(`${origin}/verify/${id}`, { width: 200, margin: 1 });
      setQr(qrData);
      setLoading(false);
    }

    void load();
  }, [id]);

  if (loading) {
    return (
      <AdminPageShell
        title="Worker card"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workers", href: "/admin/workers" },
          { label: "Card" },
        ]}
      >
        <p className="text-sm text-vera-muted">Preparing worker card…</p>
      </AdminPageShell>
    );
  }

  if (!worker) {
    return (
      <AdminPageShell
        title="Worker not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workers", href: "/admin/workers" },
          { label: "Card" },
        ]}
      >
        <p className="text-red-600">Worker not found.</p>
      </AdminPageShell>
    );
  }

  const trainingRecords = worker.trainingRecords ?? [];
  const equipmentAssignments = worker.equipmentAssignments ?? [];

  return (
    <AdminPageShell
      title="Worker card"
      description={`${worker.firstName} ${worker.lastName}`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Workers", href: "/admin/workers" },
        { label: `${worker.firstName} ${worker.lastName}`, href: `/admin/workers/${id}` },
        { label: "Card" },
      ]}
    >
      <Card className="mx-auto max-w-sm border-vera-charcoal/10 print:max-w-none print:rounded-none print:shadow-none">
        <CardContent className="flex flex-col items-center space-y-vera-4 p-vera-8 print:p-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-vera-surface">
            {worker.company?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={worker.company.logoUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs text-vera-muted">Logo</span>
            )}
          </div>
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-vera-surface">
            {worker.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={worker.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-vera-muted">No photo</span>
            )}
          </div>
          <CardTitle className="text-center text-xl">
            {worker.firstName} {worker.lastName}
          </CardTitle>
          {worker.company ? <p className="text-center text-sm text-vera-muted">{worker.company.name}</p> : null}
          <p className="text-xs text-vera-muted">Worker ID: {worker.id}</p>
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="" className="mx-auto h-40 w-40" />
          ) : null}
          <p className="max-w-full break-all text-center text-[10px] text-vera-muted">{verifyUrl}</p>
          <div className="w-full border-t border-vera-charcoal/10 pt-vera-4 text-left text-xs text-vera-charcoal">
            <p className="mb-vera-2 text-center font-semibold">Safety summary</p>
            <ul className="space-y-1 text-vera-muted">
              <li>
                Certifications: <span className="font-semibold text-vera-charcoal">{trainingRecords.length}</span>
              </li>
              <li>
                Equipment assigned: <span className="font-semibold text-vera-charcoal">{equipmentAssignments.length}</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="mx-auto flex max-w-sm flex-col gap-vera-3 print:hidden">
        <Button type="button" variant="default" className="w-full" onClick={() => window.print()}>
          Print card
        </Button>
        <Link href={`/api/worker-card/${id}`} className={buttonStyles({ variant: "teal", className: "w-full text-center" })}>
          Download PDF
        </Link>
        <Link href={`/admin/workers/${id}`} className={buttonStyles({ variant: "outline", className: "w-full text-center" })}>
          Back to worker
        </Link>
      </div>
    </AdminPageShell>
  );
}

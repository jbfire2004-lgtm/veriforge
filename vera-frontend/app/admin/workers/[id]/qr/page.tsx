import Link from "next/link";
import { API_URL } from "@/lib/api";
import { workerQrToPngDataUrl } from "@/lib/qr-render";
import { PrintButton } from "@/components/PrintButton";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

async function getWorker(id: string) {
  const res = await fetch(`${API_URL}/workers/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function WorkerQrPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await Promise.resolve(params);
  const worker = await getWorker(id);

  if (!worker) {
    return (
      <AdminPageShell
        title="Worker not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workers", href: "/admin/workers" },
          { label: "QR" },
        ]}
      >
        <p className="text-red-600">Worker not found.</p>
      </AdminPageShell>
    );
  }

  let pngDataUrl: string;
  try {
    ({ pngDataUrl } = await workerQrToPngDataUrl(id));
  } catch {
    return (
      <AdminPageShell
        title="QR error"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workers", href: "/admin/workers" },
          { label: "QR" },
        ]}
      >
        <p className="text-red-600">Could not generate QR for this worker.</p>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Worker QR code"
      description={`${worker.firstName} ${worker.lastName}`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Workers", href: "/admin/workers" },
        { label: `${worker.firstName} ${worker.lastName}`, href: `/admin/workers/${worker.id}` },
        { label: "QR" },
      ]}
    >
      <Card className="max-w-xl border-vera-charcoal/10">
        <CardHeader>
          <CardTitle>
            {worker.firstName} {worker.lastName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-vera-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pngDataUrl} alt="" className="mx-auto h-64 w-64 rounded-lg border border-vera-charcoal/10 bg-vera-white" />
          <div className="flex flex-wrap justify-center gap-vera-3">
            <a href={pngDataUrl} download={`worker-${worker.id}-qr.png`} className={buttonStyles({ variant: "teal" })}>
              Download QR
            </a>
            <PrintButton label="Print" className={buttonStyles({ variant: "default" })} />
          </div>
          <Link href={`/admin/workers/${worker.id}`} className={buttonStyles({ variant: "outline" })}>
            Back to worker
          </Link>
        </CardContent>
      </Card>

      <Card className="border-vera-charcoal/10 bg-vera-surface/40">
        <CardHeader>
          <CardTitle className="text-base">Worker record</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="max-h-80 overflow-auto rounded-lg border border-vera-charcoal/10 bg-vera-white p-vera-4 text-left text-xs leading-relaxed">
            {JSON.stringify(worker, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

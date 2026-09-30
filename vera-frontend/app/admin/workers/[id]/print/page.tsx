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

export default async function WorkerPrintCard({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { id } = await Promise.resolve(params);
  const worker = await getWorker(id);

  if (!worker) {
    return (
      <AdminPageShell
        title="Worker not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Workers", href: "/admin/workers" },
          { label: "Print" },
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
          { label: "Print" },
        ]}
      >
        <p className="text-red-600">Could not generate QR for this worker.</p>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Print worker card"
      description={`${worker.firstName} ${worker.lastName}`}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Workers", href: "/admin/workers" },
        { label: `${worker.firstName} ${worker.lastName}`, href: `/admin/workers/${worker.id}` },
        { label: "Print" },
      ]}
      className="print:bg-vera-white"
    >
      <div className="flex min-h-[60vh] items-center justify-center rounded-xl bg-vera-surface/60 p-vera-8 print:bg-transparent print:p-0">
        <Card className="w-[350px] border-vera-charcoal/10 shadow-lg print:rounded-none print:shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Worker identification card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-vera-4 text-center">
            <div className="flex justify-center">
              {worker.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={worker.photoUrl} alt="" className="h-28 w-28 rounded-lg border border-vera-charcoal/10 object-cover" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-lg border border-dashed border-vera-charcoal/20 bg-vera-surface text-xs text-vera-muted">
                  No photo
                </div>
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-vera-deep">
                {worker.firstName} {worker.lastName}
              </p>
              <p className="text-sm text-vera-muted">Worker ID: {worker.id}</p>
            </div>
            {worker.company ? (
              <div>
                <p className="font-medium text-vera-charcoal">{worker.company.name}</p>
                <p className="text-sm text-vera-muted">Company ID: {worker.company.id}</p>
              </div>
            ) : null}
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pngDataUrl} alt="" className="h-40 w-40 rounded-lg border border-vera-charcoal/10 bg-vera-white" />
            </div>
            <p className="text-xs text-vera-muted">Scan QR to verify worker status</p>
            <div className="print:hidden">
              <PrintButton label="Print card" className={buttonStyles({ variant: "default", className: "w-full" })} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageShell>
  );
}

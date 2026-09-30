"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { API_URL } from "@/lib/api-fetch";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button, Card, CardContent } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function CompanyBulkQrPage() {
  const params = useParams();
  const id = String(params?.id ?? "");

  const [company, setCompany] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const companyRes = await fetch(`${API_URL}/companies/${id}`, { credentials: "include" });
      const companyData = await companyRes.json();
      setCompany(companyData);

      const workersRes = await fetch(`${API_URL}/workers/company/${id}`, { credentials: "include" });
      const workersData = await workersRes.json();
      setWorkers(workersData);

      const qrEntries: Record<string, string> = {};
      const origin = typeof window !== "undefined" ? window.location.origin : "";

      for (const w of workersData) {
        const verifyUrl = `${origin}/verify/${w.id}`;
        const qr = await QRCode.toDataURL(verifyUrl, { width: 200, margin: 1 });
        qrEntries[w.id] = qr;
      }

      setQrMap(qrEntries);
      setLoading(false);
    }

    void load();
  }, [id]);

  if (loading) {
    return (
      <AdminPageShell
        title="Company QR codes"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Companies", href: "/admin/companies" },
          { label: "QR" },
        ]}
      >
        <p className="text-sm text-vera-muted">Generating QR codes…</p>
      </AdminPageShell>
    );
  }

  if (!company) {
    return (
      <AdminPageShell
        title="Company not found"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Companies", href: "/admin/companies" },
          { label: "QR" },
        ]}
      >
        <p className="text-red-600">Company not found.</p>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title={`${company.name} — worker QR codes`}
      description="Printable verification cards for every worker in this company."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Companies", href: "/admin/companies" },
        { label: company.name, href: `/admin/companies/${id}` },
        { label: "QR" },
      ]}
      actions={
        <Button type="button" variant="default" className="print:hidden" onClick={() => window.print()}>
          Print all
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-vera-6 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 print:gap-2">
        {workers.map((worker) => {
          const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${worker.id}`;
          const qr = qrMap[worker.id];

          return (
            <Card
              key={worker.id}
              className="flex flex-col items-center border-vera-charcoal/10 p-vera-6 print:rounded-none print:shadow-none"
            >
              <CardContent className="flex flex-col items-center space-y-vera-4 p-0">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-vera-surface">
                  {company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logoUrl} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-vera-muted">Logo</div>
                  )}
                </div>
                <div className="h-20 w-20 overflow-hidden rounded-full bg-vera-surface">
                  {worker.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={worker.photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-vera-muted">No photo</div>
                  )}
                </div>
                <h2 className="text-center text-lg font-bold text-vera-deep">
                  {worker.firstName} {worker.lastName}
                </h2>
                <p className="text-center text-sm text-vera-muted">{company.name}</p>
                <p className="text-xs text-vera-muted">Worker ID: {worker.id}</p>
                {qr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr} alt="" className="mx-auto h-32 w-32" />
                ) : null}
                <p className="max-w-full break-all text-center text-[10px] text-vera-muted">{verifyUrl}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Link href={`/admin/companies/${id}`} className={buttonStyles({ variant: "ghost", className: "print:hidden" })}>
        ← Back to company
      </Link>
    </AdminPageShell>
  );
}

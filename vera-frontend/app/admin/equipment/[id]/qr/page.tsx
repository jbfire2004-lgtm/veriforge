"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/api";
import { equipmentQrToPngDataUrl } from "@/lib/qr-render";
import { unknownToErrorMessage } from "@/lib/core";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function EquipmentQrPage() {
  const params = useParams();
  const id = String(params?.id ?? "");

  const [equipment, setEquipment] = useState<any>(null);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function load() {
      setError("");
      try {
        const res = await fetch(`${API_URL}/equipment/${id}`, { cache: "no-store" });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `GET /equipment/${id} failed`);
        }
        const data = await res.json();
        setEquipment(data);
        const { pngDataUrl } = await equipmentQrToPngDataUrl(id);
        setQrUrl(pngDataUrl);
      } catch (e) {
        setError(unknownToErrorMessage(e, "Failed to load equipment or QR"));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id]);

  if (loading) {
    return (
      <AdminPageShell
        title="Equipment QR"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Equipment", href: "/admin/equipment" },
          { label: "QR" },
        ]}
      >
        <p className="text-sm text-vera-muted">Generating equipment QR code…</p>
      </AdminPageShell>
    );
  }

  if (error || !equipment || !qrUrl) {
    return (
      <AdminPageShell
        title="Equipment QR"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Equipment", href: "/admin/equipment" },
          { label: "QR" },
        ]}
      >
        <p className="text-red-600">{error || "Equipment not found or QR generation failed."}</p>
      </AdminPageShell>
    );
  }

  const isSafe = equipment.safetyStatus === "OK";

  return (
    <AdminPageShell
      title="Equipment QR card"
      description={equipment.name}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Equipment", href: "/admin/equipment" },
        { label: equipment.name, href: `/admin/equipment/${id}` },
        { label: "QR" },
      ]}
    >
      <Card className="mx-auto max-w-sm border-vera-charcoal/10 print:max-w-none print:rounded-none print:shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{equipment.name}</CardTitle>
          {equipment.serialNumber ? (
            <p className="text-sm font-normal text-vera-muted">Serial: {equipment.serialNumber}</p>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-vera-4 px-vera-8 pb-vera-8 print:p-4">
          <Badge variant={isSafe ? "success" : "danger"}>{isSafe ? "Safe" : "Unsafe / needs review"}</Badge>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="" className="mx-auto h-40 w-40" />
          <div className="w-full border-t border-vera-charcoal/10 pt-vera-4 text-left text-xs text-vera-charcoal">
            <p className="mb-vera-2 font-semibold">Assignment summary</p>
            <ul className="space-y-1 text-vera-muted">
              <li>
                Total assignments:{" "}
                <span className="font-semibold text-vera-charcoal">{equipment.equipmentAssignments?.length ?? 0}</span>
              </li>
              {equipment.equipmentAssignments?.[0] && !equipment.equipmentAssignments[0].endedAt ? (
                <li>
                  Currently assigned:{" "}
                  <span className="font-semibold text-vera-charcoal">
                    {equipment.equipmentAssignments[0].worker
                      ? `${equipment.equipmentAssignments[0].worker.firstName} ${equipment.equipmentAssignments[0].worker.lastName}`
                      : equipment.equipmentAssignments[0].company?.name}
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex max-w-sm flex-col gap-vera-3 print:hidden">
        <Button type="button" variant="default" className="w-full" onClick={() => window.print()}>
          Print equipment card
        </Button>
        <Link href={`/admin/equipment/${id}`} className={buttonStyles({ variant: "outline", className: "w-full text-center" })}>
          Back to equipment
        </Link>
      </div>
    </AdminPageShell>
  );
}

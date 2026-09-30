"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTool } from "@/lib/api/tools-ppe";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button, Card, CardContent, Input, Label } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

export default function NewToolPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState("1");
  const [serialNumber, setSerialNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const row = await createTool({
        companyId: Number(companyId),
        name,
        serialNumber: serialNumber || undefined,
      });
      router.push(`/admin/tools-ppe/tools/${(row as { id: number }).id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create tool");
      setBusy(false);
    }
  }

  return (
    <AdminPageShell
      title="Add tool"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Tools & PPE", href: "/admin/tools-ppe" },
        { label: "New tool" },
      ]}
    >
      <Card className="max-w-lg">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <section>
              <Label>Company ID</Label>
              <Input value={companyId} onChange={(e) => setCompanyId(e.target.value)} required />
            </section>
            <section>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </section>
            <section>
              <Label>Serial number</Label>
              <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
            </section>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <section className="flex gap-2">
              <Button type="submit" variant="teal" disabled={busy}>
                {busy ? "Creating…" : "Create tool"}
              </Button>
              <Link href="/admin/tools-ppe/tools" className={buttonStyles({ variant: "outline" })}>
                Cancel
              </Link>
            </section>
          </form>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

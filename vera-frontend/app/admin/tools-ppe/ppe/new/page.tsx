"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPpe } from "@/lib/api/tools-ppe";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Button, Card, CardContent, Input, Label, Select } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";

const PPE_TYPES = [
  "HARD_HAT",
  "SAFETY_GLASSES",
  "GLOVES",
  "HARNESS",
  "FOOTWEAR",
  "HEARING",
  "RESPIRATOR",
  "COVERALL",
  "OTHER",
] as const;

export default function NewPpePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState("1");
  const [ppeType, setPpeType] = useState<string>("HARD_HAT");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const row = await createPpe({ companyId: Number(companyId), name, ppeType });
      router.push(`/admin/tools-ppe/ppe/${(row as { id: number }).id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create PPE");
      setBusy(false);
    }
  }

  return (
    <AdminPageShell
      title="Add PPE"
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Tools & PPE", href: "/admin/tools-ppe" },
        { label: "New PPE" },
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
              <Label>Type</Label>
              <Select value={ppeType} onChange={(e) => setPpeType(e.target.value)}>
                {PPE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </section>
            <p className="text-xs text-muted-foreground">
              Expiry is set automatically from PPE type (e.g. respirator 30 days, hard hat 5 years).
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <section className="flex gap-2">
              <Button type="submit" variant="teal" disabled={busy}>
                {busy ? "Creating…" : "Create PPE"}
              </Button>
              <Link href="/admin/tools-ppe/ppe" className={buttonStyles({ variant: "outline" })}>
                Cancel
              </Link>
            </section>
          </form>
        </CardContent>
      </Card>
    </AdminPageShell>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { createOrganization } from "@/lib/verihub-org-api";

export function OrgCreateForm({
  onSuccess,
}: {
  onSuccess?: (orgId: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await createOrganization({
        companyName: String(fd.get("companyName") || ""),
        ownerEmail: String(fd.get("ownerEmail") || ""),
        password: String(fd.get("password") || ""),
        ownerFullName: String(fd.get("ownerFullName") || "") || undefined,
        industry: String(fd.get("industry") || "") || undefined,
      });
      onSuccess?.(result.organization.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-lg gap-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div>
        <Label htmlFor="companyName">Company name</Label>
        <Input id="companyName" name="companyName" required minLength={2} />
      </div>
      <div>
        <Label htmlFor="ownerFullName">Owner name</Label>
        <Input id="ownerFullName" name="ownerFullName" />
      </div>
      <div>
        <Label htmlFor="ownerEmail">Owner email</Label>
        <Input id="ownerEmail" name="ownerEmail" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={12} />
      </div>
      <div>
        <Label htmlFor="industry">Industry</Label>
        <Input id="industry" name="industry" />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Creating…" : "Create organization"}
      </Button>
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { Button, Input, Label } from "@/components/ui";
import { createOrgRole } from "@/lib/verihub-org-api";

export function RoleCreateForm({ onCreated }: { onCreated?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await createOrgRole({
        name: String(fd.get("name") || ""),
        description: String(fd.get("description") || "") || undefined,
        permissions: [],
      });
      e.currentTarget.reset();
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-wrap gap-3">
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
      <div className="min-w-[12rem] flex-1">
        <Label htmlFor="name">Role name</Label>
        <Input id="name" name="name" required minLength={2} />
      </div>
      <div className="min-w-[12rem] flex-1">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={busy}>
          {busy ? "Creating…" : "Add role"}
        </Button>
      </div>
    </form>
  );
}

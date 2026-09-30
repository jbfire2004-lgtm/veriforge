"use client";

import { FormEvent, useState } from "react";
import { Button, Input, Label, Select } from "@/components/ui";
import { createOrgUser } from "@/lib/verihub-org-api";

export function UserCreateForm({ onCreated }: { onCreated?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await createOrgUser({
        email: String(fd.get("email") || ""),
        fullName: String(fd.get("fullName") || ""),
        role: String(fd.get("role") || "user"),
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
    <form onSubmit={onSubmit} className="grid max-w-2xl gap-3 sm:grid-cols-2">
      {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" defaultValue="user">
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">Worker</option>
        </Select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Creating…" : "Create user"}
        </Button>
      </div>
    </form>
  );
}

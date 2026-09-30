"use client";

import { FormEvent, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { developerApi } from "@/lib/developer-api";

export function DeveloperDashboardCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs font-normal uppercase text-zinc-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

export function FeatureFlagToggle({
  flag,
  onToggle,
  busy,
}: {
  flag: { key: string; enabled: boolean; description?: string | null };
  busy?: boolean;
  onToggle: (key: string, enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border border-zinc-200 bg-white px-4 py-3">
      <div>
        <p className="font-mono text-sm">{flag.key}</p>
        {flag.description ? (
          <p className="text-xs text-zinc-500">{flag.description}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <StatusIndicator
          label={flag.enabled ? "On" : "Off"}
          tone={flag.enabled ? "success" : "neutral"}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => onToggle(flag.key, !flag.enabled)}
        >
          Toggle
        </Button>
      </div>
    </div>
  );
}

export function ModuleBuilder({
  modules,
  onRefresh,
}: {
  modules: { code: string; name: string; isActive: boolean }[];
  onRefresh?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await fetch("/api/developer/modules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            typeof window !== "undefined"
              ? localStorage.getItem("developer_access_token")
              : ""
          }`,
        },
        body: JSON.stringify({
          code: String(fd.get("code") || ""),
          name: String(fd.get("name") || ""),
          description: String(fd.get("description") || "") || undefined,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            typeof data.error === "string" ? data.error : "Create failed",
          );
        }
      });
      e.currentTarget.reset();
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onCreate} className="grid max-w-xl gap-3 sm:grid-cols-3">
        {error ? <p className="text-sm text-red-600 sm:col-span-3">{error}</p> : null}
        <div>
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" required />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "…" : "Create module"}
          </Button>
        </div>
      </form>
      <ul className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
        {modules.map((m) => (
          <li key={m.code} className="flex justify-between px-4 py-2 text-sm">
            <span>
              {m.name}{" "}
              <span className="font-mono text-xs text-zinc-500">{m.code}</span>
            </span>
            <StatusIndicator
              label={m.isActive ? "Active" : "Inactive"}
              tone={m.isActive ? "success" : "neutral"}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LogViewer({
  items,
}: {
  items: {
    id: string;
    action: string;
    createdAt: string;
    developer?: { email: string } | null;
  }[];
}) {
  if (!items.length) {
    return <p className="text-sm text-zinc-500">No log entries.</p>;
  }
  return (
    <ul className="max-h-[28rem] overflow-auto divide-y divide-zinc-200 border border-zinc-200 bg-white font-mono text-xs">
      {items.map((row) => (
        <li key={row.id} className="px-3 py-2">
          <span className="text-zinc-500">
            {new Date(row.createdAt).toLocaleString()}
          </span>{" "}
          <span className="text-zinc-900">{row.action}</span>
          {row.developer?.email ? (
            <span className="text-zinc-500"> · {row.developer.email}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function ImpersonationPanel({ onDone }: { onDone?: (msg: string) => void }) {
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      await developerApi.impersonate(
        String(fd.get("targetOrgId") || ""),
        String(fd.get("reason") || "") || undefined,
      );
      onDone?.("Impersonation session started");
    } catch (err) {
      onDone?.(err instanceof Error ? err.message : "Impersonation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-lg gap-3">
      <div>
        <Label htmlFor="targetOrgId">Target org ID</Label>
        <Input id="targetOrgId" name="targetOrgId" required />
      </div>
      <div>
        <Label htmlFor="reason">Reason</Label>
        <Input id="reason" name="reason" />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Starting…" : "Impersonate"}
      </Button>
    </form>
  );
}

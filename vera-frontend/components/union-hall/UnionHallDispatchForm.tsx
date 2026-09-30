"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dispatchWorker } from "@/lib/api/vera-core";
import { Button, Label, Select } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

type Props = {
  hallId: number;
  members: { worker: { id: number; firstName: string; lastName: string } }[];
  companies: { id: number; name: string }[];
};

export function UnionHallDispatchForm({ hallId, members, companies }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [workerId, setWorkerId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workerId || !companyId) return;
    setBusy(true);
    try {
      await dispatchWorker(hallId, Number(workerId), Number(companyId));
      toast({ title: "Worker dispatched", variant: "success" });
      router.refresh();
    } catch (err) {
      toast({
        title: "Dispatch failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="worker">Worker</Label>
        <Select
          id="worker"
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
        >
          <option value="">Select member</option>
          {members.map((m) => (
            <option key={m.worker.id} value={m.worker.id}>
              {m.worker.firstName} {m.worker.lastName}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Select
          id="company"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          <option value="">Select company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" variant="teal" disabled={busy}>
        {busy ? "Dispatching…" : "Dispatch"}
      </Button>
    </form>
  );
}

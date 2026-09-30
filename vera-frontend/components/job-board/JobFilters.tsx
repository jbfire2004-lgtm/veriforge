"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { buttonStyles, Input, Label } from "@/components/ui";

const EXPERIENCE = ["ENTRY", "INTERMEDIATE", "JOURNEYMAN", "FOREMAN"] as const;

export function JobFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const qs = new URLSearchParams();
    for (const [k, v] of fd.entries()) {
      if (typeof v === "string" && v.trim()) qs.set(k, v.trim());
    }
    router.push(`/jobs?${qs.toString()}`);
  }

  return (
    <form onSubmit={submit} className="grid gap-vera-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-vera-1">
        <Label htmlFor="q">Search</Label>
        <Input id="q" name="q" defaultValue={params.get("q") ?? ""} placeholder="Title, company…" />
      </div>
      <div className="space-y-vera-1">
        <Label htmlFor="trade">Trade</Label>
        <Input id="trade" name="trade" defaultValue={params.get("trade") ?? ""} placeholder="Electrical" />
      </div>
      <div className="space-y-vera-1">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" defaultValue={params.get("location") ?? ""} placeholder="Edmonton" />
      </div>
      <div className="space-y-vera-1">
        <Label htmlFor="experienceLevel">Experience</Label>
        <select
          id="experienceLevel"
          name="experienceLevel"
          defaultValue={params.get("experienceLevel") ?? ""}
          className="w-full rounded-md border border-vera-border bg-white px-3 py-2 text-sm"
        >
          <option value="">Any level</option>
          {EXPERIENCE.map((l) => (
            <option key={l} value={l}>
              {l.charAt(0) + l.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-vera-1">
        <Label htmlFor="payMin">Min pay ($/hr)</Label>
        <Input id="payMin" name="payMin" type="number" defaultValue={params.get("payMin") ?? ""} />
      </div>
      <div className="space-y-vera-1">
        <Label htmlFor="ticket">Ticket</Label>
        <Input id="ticket" name="ticket" defaultValue={params.get("ticket") ?? ""} placeholder="WHMIS" />
      </div>
      <div className="sm:col-span-2 flex items-end">
        <button type="submit" className={buttonStyles({ variant: "primary", size: "md" })}>
          Search jobs
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Button, Input, Label } from "@/components/ui";

export function SubmitRecallForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");

    const form = new FormData(e.currentTarget);
    const payload = {
      product: String(form.get("product") ?? ""),
      manufacturer: String(form.get("manufacturer") ?? ""),
      recallUrl: String(form.get("recallUrl") ?? ""),
      notes: String(form.get("notes") ?? ""),
      submitterEmail: String(form.get("submitterEmail") ?? ""),
    };

    try {
      const res = await fetch("/api/public/safety-recall-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Submit failed");
      setStatus("done");
      setMessage("Thank you — your recall tip is queued for moderator review.");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Could not submit right now. Email safety@vera.com with the recall link.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[#2A2E33]/10 bg-white p-6">
      <h3 className="text-lg font-semibold text-[#2A2E33]">Submit a recall tip</h3>
      <p className="text-sm text-[#5a6b7c]">
        Share a manufacturer notice or regulator posting. VERA moderators verify before publishing.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input id="manufacturer" name="manufacturer" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product">Product / model</Label>
          <Input id="product" name="product" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="recallUrl">Official recall or bulletin URL</Label>
        <Input id="recallUrl" name="recallUrl" type="url" required placeholder="https://..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="submitterEmail">Your email (optional)</Label>
        <Input id="submitterEmail" name="submitterEmail" type="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes for moderators</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="w-full rounded-lg border border-[#2A2E33]/20 px-3 py-2 text-sm"
        />
      </div>
      {message ? (
        <p
          role="status"
          className={`text-sm ${status === "error" ? "text-red-700" : "text-[#2F8F8C]"}`}
        >
          {message}
        </p>
      ) : null}
      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}

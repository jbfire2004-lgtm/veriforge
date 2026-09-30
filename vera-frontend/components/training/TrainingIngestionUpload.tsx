"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { uploadTrainingDocument } from "@/lib/api/training-ingestion";
import { buttonStyles, Input, Label, Select } from "@/components/ui";

export type CompanyOption = { id: number; name: string };

type Props = {
  companies: CompanyOption[];
  initialCompanyId?: number;
};

export function TrainingIngestionUpload({ companies, initialCompanyId }: Props) {
  const defaultCompany =
    initialCompanyId ??
    (companies.length === 1 ? companies[0].id : companies[0]?.id);
  const [companyId, setCompanyId] = useState(
    defaultCompany != null ? String(defaultCompany) : "",
  );
  const [file, setFile] = useState<File | null>(null);
  const [workerId, setWorkerId] = useState("");
  const [certificationCode, setCertificationCode] = useState("WHMIS");
  const [issuedAt, setIssuedAt] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [useAdvancedJson, setUseAdvancedJson] = useState(false);
  const [metadataJson, setMetadataJson] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const metadataPreview = useMemo(() => {
    if (useAdvancedJson && metadataJson.trim()) return metadataJson.trim();
    const wid = Number(workerId);
    if (!Number.isFinite(wid) || wid < 1) return "";
    return JSON.stringify({
      rows: [
        {
          workerId: wid,
          issuedAt: `${issuedAt}T00:00:00.000Z`,
          expiresAt: `${expiresAt}T00:00:00.000Z`,
          certificationCode: certificationCode.trim() || undefined,
        },
      ],
    });
  }, [
    useAdvancedJson,
    metadataJson,
    workerId,
    issuedAt,
    expiresAt,
    certificationCode,
  ]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const cid = Number(companyId);
    if (!Number.isFinite(cid) || cid < 1) {
      setStatus("Select a company before uploading.");
      return;
    }
    if (!metadataPreview && !file.name.toLowerCase().endsWith(".json")) {
      setStatus(
        "Enter a worker ID (and dates), or switch to advanced JSON metadata, or upload a .json file with rows.",
      );
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("companyId", String(cid));
      if (metadataPreview) form.append("metadata", metadataPreview);
      const result = await uploadTrainingDocument(form);
      const created = result?.createdRecords?.length ?? 0;
      setStatus(
        `Upload complete — run #${result?.id ?? "ok"}${created ? `, ${created} training record(s) created` : ""}.`,
      );
      setFile(null);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  if (companies.length === 0) {
    return (
      <p className="text-sm text-red-600">
        No companies found. Create a company under Admin → Companies before uploading
        training for a roster.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="upload-company">Company</Label>
        <Select
          id="upload-company"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          required
        >
          <option value="">Select company</option>
          {companies.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Drag and drop PDF, PNG, JPG, or JSON — or choose a file
        </p>
        <Input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.json"
          className="mx-auto mt-4 max-w-sm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file && <p className="mt-2 text-sm font-medium">{file.name}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={useAdvancedJson}
          onChange={(e) => setUseAdvancedJson(e.target.checked)}
        />
        Advanced: paste full metadata JSON
      </label>

      {useAdvancedJson ? (
        <div>
          <Label htmlFor="metadata">Metadata JSON</Label>
          <textarea
            id="metadata"
            className="mt-1 w-full rounded-md border px-3 py-2 font-mono text-sm"
            rows={5}
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
            placeholder='{"rows":[{"workerId":1,"issuedAt":"2024-01-01","expiresAt":"2027-01-01","certificationCode":"WHMIS"}]}'
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="workerId">Worker ID</Label>
            <Input
              id="workerId"
              type="number"
              min={1}
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="From workers list"
            />
          </div>
          <div>
            <Label htmlFor="certCode">Certification code</Label>
            <Input
              id="certCode"
              value={certificationCode}
              onChange={(e) => setCertificationCode(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="issuedAt">Issued</Label>
            <Input
              id="issuedAt"
              type="date"
              value={issuedAt}
              onChange={(e) => setIssuedAt(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="expiresAt">Expires</Label>
            <Input
              id="expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Prefer a simple form?{" "}
        <Link href="/admin/training/new" className="text-teal-700 underline">
          Add training record manually
        </Link>
      </p>

      <button
        type="submit"
        disabled={!file || busy || !companyId}
        className={buttonStyles({ variant: "teal" })}
      >
        {busy ? "Uploading…" : "Upload & start verification"}
      </button>
      {status && (
        <p
          className={`text-sm ${status.includes("complete") ? "text-teal-800" : status.includes("failed") || status.includes("Enter") || status.includes("Select") ? "text-red-600" : ""}`}
        >
          {status}
        </p>
      )}
    </form>
  );
}

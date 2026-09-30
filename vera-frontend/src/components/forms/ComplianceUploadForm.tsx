"use client";

import { FormEvent, useState } from "react";
import { Button, FileUpload, Input, Label, Select } from "@/components/ui";
import { uploadComplianceArtifact } from "@/lib/compliance-api";

export function ComplianceUploadForm({ onUploaded }: { onUploaded?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      await uploadComplianceArtifact({
        type: String(fd.get("type") || "insurance"),
        fileUrl: fileUrl || String(fd.get("fileUrl") || ""),
        expiryDate: String(fd.get("expiryDate") || "") || null,
        label: String(fd.get("label") || "") || undefined,
      });
      e.currentTarget.reset();
      setFileUrl("");
      onUploaded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-xl gap-3">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div>
        <Label htmlFor="type">Artifact type</Label>
        <Select id="type" name="type" defaultValue="insurance">
          <option value="insurance">Insurance</option>
          <option value="wcb">WCB</option>
          <option value="cor">COR</option>
          <option value="scsa">SCSA</option>
          <option value="custom">Custom</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="label">Label</Label>
        <Input id="label" name="label" placeholder="Optional label" />
      </div>
      <FileUpload
        label="Document"
        accept=".pdf,image/*"
        onFileReady={({ url }) => setFileUrl(url)}
      />
      <div>
        <Label htmlFor="fileUrl">Or paste file URL</Label>
        <Input
          id="fileUrl"
          name="fileUrl"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://…"
        />
      </div>
      <div>
        <Label htmlFor="expiryDate">Expiry date</Label>
        <Input id="expiryDate" name="expiryDate" type="date" />
      </div>
      <Button type="submit" disabled={busy || !fileUrl}>
        {busy ? "Uploading…" : "Upload artifact"}
      </Button>
    </form>
  );
}

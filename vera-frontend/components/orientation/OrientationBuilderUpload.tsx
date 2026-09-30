"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrientation, uploadOrientationFiles } from "@/lib/orientation/api";
import { Button, Input, Label } from "@/components/ui";
import { WorkspaceSection } from "@/components/theme/workspace";

type Props = {
  companyId?: number;
  projectId?: number;
  redirectBase: string;
};

export function OrientationBuilderUpload({ companyId, projectId, redirectBase }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("Uploaded orientation");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const pkg = await createOrientation({
        companyId,
        projectId,
        type: "UPLOAD",
        title,
        languages: ["en", "fr", "es", "tl", "pa"],
      });
      if (file) {
        await uploadOrientationFiles(pkg.id, [file]);
      }
      router.push(`${redirectBase}/${pkg.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspaceSection
      title="Upload orientation"
      description="PDF, PPT, DOCX, images, video — OCR and sectioning (pipeline v1)"
    >
      <form onSubmit={handleSubmit} className="grid max-w-xl gap-4 rounded-2xl border border-[#2A2E33]/10 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="title">Package title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">Source file</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg,.mp4,.zip"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="text-xs text-[#64748b]">{file.name} — OCR and sectioning on upload</p>
          ) : null}
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Processing…" : "Create from upload"}
        </Button>
      </form>
    </WorkspaceSection>
  );
}

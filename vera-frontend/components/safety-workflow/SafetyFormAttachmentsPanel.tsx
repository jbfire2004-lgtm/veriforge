"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addSafetyFormAttachment,
  listSafetyFormAttachments,
  removeSafetyFormAttachment,
} from "@/lib/safety-workflow";
import { buttonStyles } from "@/components/ui/button";

type Attachment = {
  id: string;
  fileName: string;
  mimeType?: string | null;
};

type Props = {
  formId: string;
  readOnly?: boolean;
};

export function SafetyFormAttachmentsPanel({ formId, readOnly }: Props) {
  const [items, setItems] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const rows = await listSafetyFormAttachments(formId);
    setItems(rows);
  }, [formId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || readOnly) return;
    setBusy(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await addSafetyFormAttachment(formId, {
        fileName: file.name,
        mimeType: file.type,
        dataUrl,
        sizeBytes: file.size,
        fieldId: "photos",
      });
      await load();
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  async function remove(id: string) {
    if (readOnly) return;
    setBusy(true);
    try {
      await removeSafetyFormAttachment(formId, id);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--card-border)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Photos & files</h3>
        {!readOnly ? (
          <label className={buttonStyles({ variant: "outline", size: "sm", className: "cursor-pointer" })}>
            {busy ? "Uploading…" : "Add photo"}
            <input
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              disabled={busy}
              onChange={(e) => void onFileChange(e)}
            />
          </label>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-vera-muted">No attachments yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex min-h-11 items-center justify-between gap-2 rounded-lg bg-vera-surface px-3 text-sm"
            >
              <span>{a.fileName}</span>
              {!readOnly ? (
                <button
                  type="button"
                  className={buttonStyles({ variant: "ghost", size: "sm" })}
                  disabled={busy}
                  onClick={() => void remove(a.id)}
                >
                  Remove
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

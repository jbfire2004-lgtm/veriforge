"use client";

import { useState } from "react";
import { FileSearch, Upload } from "lucide-react";
import { useVisionAnalysis } from "@/lib/vision";
import { extractTextFromFile } from "@/lib/vision/ocr-client";
import type { DocumentType } from "@vera/vision";

type Props = {
  documentType?: DocumentType;
  companyId?: number;
};

export function DocumentReviewPanel({
  documentType = "training_certificate",
  companyId,
}: Props) {
  const { result, loading, error, analyze } = useVisionAnalysis();
  const [ocrText, setOcrText] = useState("");

  async function onFile(file: File) {
    const text = await extractTextFromFile(file);
    setOcrText(text);
    if (text) await analyze({ documentType, ocrText: text, companyId });
  }

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: "var(--vera-border)", background: "var(--vera-surface)" }}
    >
      <div className="flex items-center gap-2">
        <FileSearch className="h-5 w-5" style={{ color: "var(--vera-accent)" }} />
        <h3 className="font-semibold">Document intelligence</h3>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm">
        <Upload className="h-4 w-4" />
        Upload certificate or form
        <input
          type="file"
          accept="image/*,.pdf,.txt"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
        />
      </label>
      <textarea
        value={ocrText}
        onChange={(e) => setOcrText(e.target.value)}
        placeholder="Or paste OCR text…"
        className="mt-2 w-full rounded border p-2 text-sm"
        rows={4}
      />
      <button
        type="button"
        disabled={loading || !ocrText.trim()}
        className="mt-2 rounded px-3 py-1.5 text-sm text-white"
        style={{ background: "var(--vera-accent)" }}
        onClick={() => analyze({ documentType, ocrText, companyId })}
      >
        {loading ? "Analyzing…" : "Analyze"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-4 space-y-2 text-sm">
          <p className="font-medium">{result.summary.text}</p>
          <ul className="list-disc pl-4 text-muted-foreground">
            {result.summary.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          {result.fraud.signals.length > 0 && (
            <div className="rounded bg-amber-50 p-2 dark:bg-amber-950">
              <p className="font-medium">Fraud alerts</p>
              {result.fraud.signals.map((s) => (
                <p key={s.code}>{s.message}</p>
              ))}
            </div>
          )}
          {result.mappings.length > 0 && (
            <div>
              <p className="font-medium">Auto-mapped</p>
              {result.mappings.map((m) => (
                <p key={`${m.entityType}-${m.entityId ?? m.label}`}>
                  {m.entityType}: {m.label} ({Math.round(m.score * 100)}%)
                </p>
              ))}
            </div>
          )}
          {result.reviewRequired && (
            <p className="text-amber-700">Requires manual review</p>
          )}
        </div>
      )}
    </div>
  );
}

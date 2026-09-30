"use client";

import { useCallback, useState } from "react";
import { FileSearch } from "lucide-react";
import {
  analyzeDocumentIntelligence,
  analyzeDocumentIntelligenceUpload,
  type DocumentIntelligenceAiResult,
} from "@/lib/document-intelligence-ai";

type DocumentIntelligencePanelProps = {
  documentId?: number;
  ocrText?: string;
  fileName?: string;
  companyId?: number;
  projectId?: number;
  workerId?: number;
  file?: File | null;
  onResult?: (result: DocumentIntelligenceAiResult) => void;
};

export function DocumentIntelligencePanel({
  documentId,
  ocrText,
  fileName,
  companyId,
  projectId,
  workerId,
  file,
  onResult,
}: DocumentIntelligencePanelProps) {
  const [result, setResult] = useState<DocumentIntelligenceAiResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(() => {
    setBusy(true);
    setError(null);

    const promise = file
      ? analyzeDocumentIntelligenceUpload(file, { companyId, projectId, workerId })
      : analyzeDocumentIntelligence({
          documentId,
          ocrText,
          fileName,
          companyId,
          projectId,
          workerId,
        });

    void promise
      .then((res) => {
        setResult(res);
        onResult?.(res);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Document analysis failed"))
      .finally(() => setBusy(false));
  }, [documentId, ocrText, fileName, companyId, projectId, workerId, file, onResult]);

  const canRun = Boolean(file || documentId || ocrText || fileName);

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium text-slate-900">
          <FileSearch className="h-4 w-4" />
          Document Intelligence
        </div>
        <button
          type="button"
          className="rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          disabled={!canRun || busy}
          onClick={() => void run()}
        >
          {busy ? "Processing…" : "Analyze document"}
        </button>
      </div>

      {error ? <p className="text-xs text-red-600" role="alert">{error}</p> : null}

      {result ? (
        <div className="space-y-2 text-xs">
          <p>
            <span className="font-semibold capitalize">
              {result.document_type.replace(/_/g, " ")}
            </span>
            {" · "}
            Authenticity {result.authenticity_score}/100 · Confidence{" "}
            {result.confidence_score}/100
          </p>
          <p className="text-slate-600">{result.field_summary}</p>

          {Object.keys(result.metadata).length > 0 ? (
            <dl className="grid grid-cols-2 gap-1 rounded border border-slate-200 bg-white p-2">
              {Object.entries(result.metadata).map(([key, value]) => (
                <div key={key}>
                  <dt className="font-medium text-slate-500">{key.replace(/_/g, " ")}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {result.auto_links.length > 0 ? (
            <div>
              <p className="font-semibold text-slate-700">Auto-links</p>
              <ul className="list-disc pl-4">
                {result.auto_links.map((link) => (
                  <li key={`${link.entity_type}-${link.entity_id}`}>
                    {link.label} ({link.entity_type}, {link.confidence}%)
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.recommended_actions.length > 0 ? (
            <div>
              <p className="font-semibold text-slate-700">Recommended actions</p>
              <ul className="list-disc pl-4">
                {result.recommended_actions.map((action) => (
                  <li key={action.action}>
                    [{action.priority}] {action.action}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

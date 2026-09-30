"use client";

import { Download, ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import { classifyDocumentMime, type WorkerDocument } from "./training-api";

type Props = {
  document: WorkerDocument;
  /** Hide the section header (`title`) when used inside a parent card. */
  embedded?: boolean;
};

export function FilePreview({ document, embedded }: Props) {
  const kind = classifyDocumentMime(document.name, document.url);

  return (
    <div className={cn("space-y-vera-3", embedded && "")}>
      <div className="flex flex-wrap items-center justify-between gap-vera-3">
        <div className="flex min-w-0 items-center gap-vera-3">
          {kind === "image" ? (
            <ImageIcon className="h-5 w-5 shrink-0 text-vera-deep" aria-hidden />
          ) : (
            <FileText className="h-5 w-5 shrink-0 text-vera-deep" aria-hidden />
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-vera-charcoal">{document.name}</p>
            <p className="text-xs uppercase tracking-wider text-vera-muted">
              {document.type ?? "Document"} · {kind.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-vera-2">
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            <ExternalLink className="mr-vera-2 h-4 w-4" aria-hidden />
            Open
          </a>
          <a
            href={document.url}
            download
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            <Download className="mr-vera-2 h-4 w-4" aria-hidden />
            Download
          </a>
        </div>
      </div>

      {kind === "pdf" && (
        <object
          data={document.url}
          type="application/pdf"
          className="h-[480px] w-full rounded-xl border border-vera-charcoal/15 bg-vera-surface"
          aria-label={document.name}
        >
          <PreviewFallback document={document} />
        </object>
      )}

      {kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={document.url}
          alt={document.name}
          className="max-h-[480px] w-full rounded-xl border border-vera-charcoal/15 bg-vera-surface object-contain"
        />
      )}

      {kind === "other" && <PreviewFallback document={document} />}
    </div>
  );
}

function PreviewFallback({ document }: { document: WorkerDocument }) {
  return (
    <div className="rounded-xl border border-dashed border-vera-charcoal/20 bg-vera-surface/40 p-vera-5 text-center">
      <p className="text-sm text-vera-muted">
        Inline preview is not available for this file type.
      </p>
      <div className="mt-vera-3 flex justify-center">
        <a
          href={document.url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles({ variant: "teal", size: "sm" })}
        >
          Open file in new tab
        </a>
      </div>
    </div>
  );
}

export function FilePreviewEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-vera-charcoal/20 bg-vera-surface/40 p-vera-5 text-center">
      <p className="text-sm text-vera-muted">{message}</p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Copy, Download, FolderPlus, Loader2 } from "lucide-react";
import type { GeneratedBriefing } from "@/lib/briefing/briefing-types";
import { exportBriefingPdf } from "@/lib/briefing/export-briefing-pdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/src/lib/utils";

type Props = {
  briefing: GeneratedBriefing | null;
  loading?: boolean;
};

export function BriefingPreview({ briefing, loading }: Props) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  async function copyToClipboard() {
    if (!briefing) return;
    try {
      await navigator.clipboard.writeText(briefing.plainText);
      toast({ title: "Copied", description: "Briefing copied to clipboard.", variant: "success" });
    } catch {
      toast({ title: "Copy failed", description: "Could not access clipboard.", variant: "error" });
    }
  }

  async function downloadPdf() {
    if (!briefing) return;
    setExporting(true);
    try {
      const blob = await exportBriefingPdf(briefing);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vera-daily-briefing-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "PDF ready", description: "Briefing downloaded.", variant: "success" });
    } catch {
      toast({ title: "Export failed", description: "Could not create PDF.", variant: "error" });
    } finally {
      setExporting(false);
    }
  }

  function saveToLibrary() {
    toast({
      title: "Coming soon",
      description: "Save to company library will be available in a future release.",
      variant: "default",
    });
  }

  return (
    <Card className="flex h-full flex-col border-vera-charcoal/10 shadow-md">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-lg">Generated briefing</CardTitle>
          {briefing ? (
            <p className="mt-1 text-xs text-vera-muted">
              {new Date(briefing.generatedAt).toLocaleString()} ·{" "}
              {briefing.source === "openai" ? "AI-assisted" : "Template"}
            </p>
          ) : (
            <p className="mt-1 text-xs text-vera-muted">
              Complete the form and click Generate briefing.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!briefing || loading}
            onClick={() => void copyToClipboard()}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!briefing || loading || exporting}
            onClick={() => void downloadPdf()}
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            PDF
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!briefing}
            onClick={saveToLibrary}
          >
            <FolderPlus className="h-3.5 w-3.5" />
            Save to library
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-vera-muted">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-[#2F8F8C]" />
            Generating…
          </div>
        ) : !briefing ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-vera-charcoal/20 bg-vera-surface/40 px-6 text-center text-sm text-vera-muted">
            Your toolbox talk, FLHA, or crew briefing preview will appear here.
          </div>
        ) : (
          <article
            className={cn(
              "max-h-[min(70vh,640px)] overflow-y-auto rounded-xl border border-[#2A2E33]/10",
              "bg-gradient-to-b from-white to-[#f8fafc] p-5 shadow-inner",
            )}
          >
            <h2 className="text-xl font-bold text-[#2A2E33]">{briefing.title}</h2>
            <div className="mt-6 space-y-6">
              {briefing.sections.map((section) => (
                <section key={section.id}>
                  <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-[#2F8F8C]">
                    {section.heading}
                  </h3>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#374151]">
                    {section.body}
                  </pre>
                </section>
              ))}
            </div>
          </article>
        )}
      </CardContent>
    </Card>
  );
}

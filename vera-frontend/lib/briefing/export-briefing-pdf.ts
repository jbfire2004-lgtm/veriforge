import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { GeneratedBriefing } from "./briefing-types";

export async function exportBriefingPdf(briefing: GeneratedBriefing): Promise<Blob> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([612, 792]);
  let y = page.getSize().height - 50;
  const margin = 50;
  const lineHeight = 14;

  const drawLine = (text: string, size = 10, useBold = false) => {
    if (y < 60) {
      page = doc.addPage([612, 792]);
      y = page.getSize().height - 50;
    }
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: useBold ? bold : font,
      color: rgb(0.1, 0.16, 0.25),
      maxWidth: 512,
    });
    y -= lineHeight;
  };

  drawLine("VERA — Daily Safety Briefing", 16, true);
  drawLine(`Generated: ${new Date(briefing.generatedAt).toLocaleString()}`, 9);
  drawLine(`Source: ${briefing.source === "openai" ? "AI-assisted" : "Template"}`, 9);
  y -= 8;

  for (const section of briefing.sections) {
    drawLine(section.heading, 12, true);
    for (const line of wrapLines(section.body, 85)) {
      drawLine(line, 10);
    }
    y -= 6;
  }

  const bytes = await doc.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}

function wrapLines(text: string, maxLen: number): string[] {
  const out: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) {
      out.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (next.length > maxLen) {
        if (line) out.push(line);
        line = w;
      } else {
        line = next;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

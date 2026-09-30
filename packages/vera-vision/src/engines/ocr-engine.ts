import type { OcrBlock, OcrResult } from "../types";

export type OcrInput = {
  text?: string;
  blocks?: OcrBlock[];
  imageBase64?: string;
};

/**
 * OCR engine — accepts pre-extracted text (client Tesseract / cloud OCR)
 * or raw text paste. Image pipeline hooks via `registerProvider`.
 */
export class OcrEngine {
  private provider: ((input: OcrInput) => Promise<OcrResult>) | null = null;

  registerProvider(fn: (input: OcrInput) => Promise<OcrResult>): void {
    this.provider = fn;
  }

  async extract(input: OcrInput): Promise<OcrResult> {
    if (this.provider) return this.provider(input);
    if (input.text?.trim()) {
      return this.fromText(input.text, "text-input");
    }
    if (input.blocks?.length) {
      const fullText = input.blocks.map((b) => b.text).join("\n");
      return { fullText, blocks: input.blocks, engine: "blocks" };
    }
    if (input.imageBase64) {
      return {
        fullText: "",
        blocks: [],
        engine: "image-pending",
      };
    }
    return { fullText: "", blocks: [], engine: "none" };
  }

  fromText(text: string, engine = "heuristic"): OcrResult {
    const lines = text.split(/\r?\n/).filter(Boolean);
    const blocks: OcrBlock[] = lines.map((line, i) => ({
      text: line,
      confidence: 0.85,
      bbox: { x: 0, y: i * 20, w: 100, h: 20 },
    }));
    return { fullText: text, blocks, engine };
  }
}

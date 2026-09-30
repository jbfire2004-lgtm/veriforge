"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrEngine = void 0;
/**
 * OCR engine — accepts pre-extracted text (client Tesseract / cloud OCR)
 * or raw text paste. Image pipeline hooks via `registerProvider`.
 */
class OcrEngine {
    constructor() {
        this.provider = null;
    }
    registerProvider(fn) {
        this.provider = fn;
    }
    async extract(input) {
        if (this.provider)
            return this.provider(input);
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
    fromText(text, engine = "heuristic") {
        const lines = text.split(/\r?\n/).filter(Boolean);
        const blocks = lines.map((line, i) => ({
            text: line,
            confidence: 0.85,
            bbox: { x: 0, y: i * 20, w: 100, h: 20 },
        }));
        return { fullText: text, blocks, engine };
    }
}
exports.OcrEngine = OcrEngine;
//# sourceMappingURL=ocr-engine.js.map
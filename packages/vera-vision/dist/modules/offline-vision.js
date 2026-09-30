"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeOffline = analyzeOffline;
const document_pipeline_1 = require("./document-pipeline");
/** Offline vision — same pipeline, marks OCR source as offline-capable */
async function analyzeOffline(input, engines) {
    const result = await (0, document_pipeline_1.runDocumentPipeline)({ ...input, offline: true }, engines);
    return {
        ...result,
        ocr: { ...result.ocr, engine: `offline:${result.ocr.engine}` },
    };
}
//# sourceMappingURL=offline-vision.js.map
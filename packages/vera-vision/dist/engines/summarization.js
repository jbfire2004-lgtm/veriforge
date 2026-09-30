"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisionSummarizationEngine = void 0;
class VisionSummarizationEngine {
    summarize(title, fields, fraud, mappings, extras) {
        const bullets = [
            `${fields.length} fields extracted`,
            mappings.length ? `${mappings.length} auto-mapped entities` : "No auto-mappings",
            fraud.signals.length ? `${fraud.signals.length} fraud signals (score ${fraud.score})` : "No fraud signals",
            ...(extras ?? []),
        ];
        const text = `${title}: ${bullets.slice(0, 4).join("; ")}`;
        return { text, bullets };
    }
}
exports.VisionSummarizationEngine = VisionSummarizationEngine;
//# sourceMappingURL=summarization.js.map
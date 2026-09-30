"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormFieldExtractionEngine = void 0;
const FORM_PATTERNS = {
    inspectorName: [/inspector[:\s]+(.+)/i, /completed\s+by[:\s]+(.+)/i],
    equipmentId: [/equipment\s*(?:#|id)[:\s]*([A-Z0-9-]+)/i, /unit[:\s]+(.+)/i],
    passFail: [/(pass|fail|satisfactory|unsatisfactory)/i],
    notes: [/notes?[:\s]+(.+)/i, /comments?[:\s]+(.+)/i],
    projectName: [/project[:\s]+(.+)/i, /job\s*(?:#|no)[:\s]*(.+)/i],
    hazard: [/hazard[:\s]+(.+)/i, /risk[:\s]+(.+)/i],
};
class FormFieldExtractionEngine {
    extract(ocr) {
        const text = ocr.fullText;
        const fields = [];
        for (const [key, patterns] of Object.entries(FORM_PATTERNS)) {
            for (const re of patterns) {
                const m = text.match(re);
                if (m?.[1]) {
                    fields.push({ key, value: m[1].trim().slice(0, 300), confidence: 0.78, source: "form-regex" });
                    break;
                }
                if (m?.[0] && key === "passFail") {
                    fields.push({ key, value: m[1] ?? m[0], confidence: 0.7, source: "form-regex" });
                    break;
                }
            }
        }
        return fields;
    }
}
exports.FormFieldExtractionEngine = FormFieldExtractionEngine;
//# sourceMappingURL=form-field-extractor.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveVisionCapabilities = resolveVisionCapabilities;
exports.attachAnalysisMeta = attachAnalysisMeta;
function resolveVisionCapabilities(opts) {
    var _a;
    const messages = [];
    const ocrEnabled = !opts.ocrDisabledByEnv;
    const llmEnabled = opts.llmConfigured;
    const externalOcrConfigured = Boolean((_a = opts.externalOcrUrl) === null || _a === void 0 ? void 0 : _a.trim());
    let recommendedMode = 'full';
    if (!ocrEnabled && !llmEnabled) {
        recommendedMode = 'caption_fallback';
        messages.push('Vision OCR disabled and LLM not configured — using caption/rules fallback only.');
    }
    else if (!llmEnabled && !opts.ocrTextProvided) {
        recommendedMode = ocrEnabled ? 'vision_rules' : 'caption_fallback';
        messages.push('LLM not configured — hazard detection uses Vera Vision rules engine.');
    }
    else if (!opts.ocrTextProvided && !externalOcrConfigured) {
        recommendedMode = 'vision_rules';
        messages.push('No OCR text supplied — analysis uses image hints and rule-based extraction.');
    }
    return {
        ocrEnabled,
        llmEnabled,
        externalOcrConfigured,
        recommendedMode,
        messages,
    };
}
function attachAnalysisMeta(result, mode, capabilities) {
    return Object.assign(Object.assign({}, result), { analysisMode: mode, capabilities });
}
//# sourceMappingURL=vision-capabilities.js.map
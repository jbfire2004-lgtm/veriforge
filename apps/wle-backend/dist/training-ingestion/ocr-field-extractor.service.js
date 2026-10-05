"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrFieldExtractorService = void 0;
const common_1 = require("@nestjs/common");
const CERT_PATTERNS = [
    { code: 'WHMIS', name: 'WHMIS', re: /\bWHMIS\b/i },
    { code: 'FALL-ARREST', name: 'Fall Arrest', re: /\bfall\s*arrest\b/i },
    { code: 'FIRST-AID', name: 'First Aid', re: /\bfirst\s*aid\b/i },
    {
        code: 'CONFINED-SPACE',
        name: 'Confined Space',
        re: /\bconfined\s*space\b/i,
    },
    { code: 'AERIAL-LIFT', name: 'Aerial Lift', re: /\baerial\s*lift\b/i },
    { code: 'SCAFFOLD', name: 'Scaffolding', re: /\bscaffold(ing)?\b/i },
    { code: 'H2S', name: 'H2S Alive', re: /\bH2S\b/i },
    { code: 'CSTS', name: 'CSTS', re: /\bCSTS\b/i },
];
const DATE_LABEL = /(?:expir(?:y|es|ation)|valid\s*until|renew(?:al)?|expires?)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{2}-\d{2})/i;
const ISSUED_LABEL = /(?:issued?|completion|completed|date\s*of\s*issue)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{2}-\d{2})/i;
const NAME_LABEL = /(?:trainee|student|worker|name|participant)\s*[:\-]?\s*([A-Za-z][A-Za-z.'\-]*(?: [A-Za-z][A-Za-z.'\-]*){0,4})/i;
const CERT_NUM = /(?:certificate|cert\.?|card)\s*(?:#|no\.?|number)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-]{4,24})/i;
let OcrFieldExtractorService = class OcrFieldExtractorService {
    extract(text) {
        const normalized = text.replace(/\r\n/g, '\n');
        const fieldConfidence = {};
        const out = {
            confidence: 0,
            fieldConfidence,
        };
        const nameMatch = NAME_LABEL.exec(normalized);
        if (nameMatch === null || nameMatch === void 0 ? void 0 : nameMatch[1]) {
            out.workerName = nameMatch[1].trim();
            fieldConfidence.workerName = 0.75;
        }
        for (const p of CERT_PATTERNS) {
            if (p.re.test(normalized)) {
                out.certificationName = p.name;
                if (p.code)
                    out.certificationCode = p.code;
                fieldConfidence.certificationName = 0.8;
                break;
            }
        }
        const certLine = normalized
            .split('\n')
            .find((l) => /training|certification|course/i.test(l) && l.length < 120);
        if (!out.certificationName && certLine) {
            out.certificationName = certLine
                .replace(/^[^A-Za-z]*/, '')
                .trim()
                .slice(0, 80);
            fieldConfidence.certificationName = 0.45;
        }
        const expMatch = DATE_LABEL.exec(normalized);
        if (expMatch === null || expMatch === void 0 ? void 0 : expMatch[1]) {
            out.expiresAt = expMatch[1].trim();
            fieldConfidence.expiresAt = 0.7;
        }
        const issuedMatch = ISSUED_LABEL.exec(normalized);
        if (issuedMatch === null || issuedMatch === void 0 ? void 0 : issuedMatch[1]) {
            out.issuedAt = issuedMatch[1].trim();
            fieldConfidence.issuedAt = 0.65;
        }
        const numMatch = CERT_NUM.exec(normalized);
        if (numMatch === null || numMatch === void 0 ? void 0 : numMatch[1]) {
            out.certificateNumber = numMatch[1].trim();
            fieldConfidence.certificateNumber = 0.6;
        }
        const scores = Object.values(fieldConfidence);
        out.confidence =
            scores.length > 0
                ? scores.reduce((a, b) => a + b, 0) / scores.length
                : normalized.includes('[VERA_OCR_STUB]')
                    ? 0.05
                    : 0.2;
        return out;
    }
};
exports.OcrFieldExtractorService = OcrFieldExtractorService;
exports.OcrFieldExtractorService = OcrFieldExtractorService = __decorate([
    (0, common_1.Injectable)()
], OcrFieldExtractorService);
//# sourceMappingURL=ocr-field-extractor.service.js.map
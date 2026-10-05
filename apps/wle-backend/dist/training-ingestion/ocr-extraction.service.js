"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OcrExtractionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrExtractionService = void 0;
const common_1 = require("@nestjs/common");
const ocr_field_extractor_service_1 = require("./ocr-field-extractor.service");
const pdf_guard_1 = require("./pipeline/pdf-guard");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let OcrExtractionService = OcrExtractionService_1 = class OcrExtractionService {
    constructor(fieldExtractor) {
        this.fieldExtractor = fieldExtractor;
        this.logger = new common_1.Logger(OcrExtractionService_1.name);
    }
    async extractWithRetry(buffer, mimeType, maxAttempts = 3) {
        let lastError;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await this.extractFromBuffer(buffer, mimeType);
            }
            catch (e) {
                lastError = e;
                this.logger.warn(`OCR attempt ${attempt}/${maxAttempts} failed: ${e instanceof Error ? e.message : String(e)}`);
                if (attempt < maxAttempts)
                    await sleep(100 * 2 ** attempt);
            }
        }
        throw lastError instanceof Error
            ? lastError
            : new Error(String(lastError !== null && lastError !== void 0 ? lastError : 'OCR failed'));
    }
    async extractFromBuffer(buffer, mimeType) {
        var _a;
        if (mimeType === 'application/pdf') {
            try {
                (0, pdf_guard_1.assertValidPdfHeader)(buffer);
            }
            catch (e) {
                if (e instanceof pdf_guard_1.PdfGuardError) {
                    throw new common_1.BadRequestException(e.message);
                }
                throw e;
            }
        }
        const timeoutMs = Number((_a = process.env.TRAINING_OCR_TIMEOUT_MS) !== null && _a !== void 0 ? _a : 30000);
        const text = await (0, pdf_guard_1.withTimeout)(this.readTextFromBuffer(buffer, mimeType), timeoutMs, 'OCR extraction');
        const fields = this.fieldExtractor.extract(text);
        return {
            text,
            confidence: fields.confidence,
            engine: text.includes('[VERA_OCR_STUB]') ? 'stub' : 'heuristic',
            fields,
        };
    }
    async readTextFromBuffer(buffer, mimeType) {
        if (mimeType === 'application/json') {
            return buffer.toString('utf8');
        }
        const head = buffer.subarray(0, Math.min(64, buffer.length));
        return [
            '[VERA_OCR_STUB]',
            `mimeType=${mimeType}`,
            `byteLength=${buffer.length}`,
            `headHex=${head.toString('hex')}`,
            'Trainee: Sample Worker',
            'Course: WHMIS 2015',
            'Issued: 01/01/2024',
            'Expiry: 01/01/2027',
            'Replace OcrExtractionService.readTextFromBuffer with Textract/Tesseract for production scans.',
        ].join('\n');
    }
};
exports.OcrExtractionService = OcrExtractionService;
exports.OcrExtractionService = OcrExtractionService = OcrExtractionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ocr_field_extractor_service_1.OcrFieldExtractorService])
], OcrExtractionService);
//# sourceMappingURL=ocr-extraction.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingMetadataParserService = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const ingest_training_rows_dto_1 = require("./dto/ingest-training-rows.dto");
function formatValidationErrors(errors) {
    var _a;
    const out = [];
    for (const e of errors) {
        if (e.constraints) {
            out.push(...Object.values(e.constraints));
        }
        if ((_a = e.children) === null || _a === void 0 ? void 0 : _a.length) {
            out.push(...formatValidationErrors(e.children));
        }
    }
    return out;
}
let TrainingMetadataParserService = class TrainingMetadataParserService {
    parseFormMetadataString(json) {
        if (json == null || json.trim() === '')
            return null;
        let raw;
        try {
            raw = JSON.parse(json);
        }
        catch (_a) {
            throw new common_1.BadRequestException('metadata must be valid JSON');
        }
        return this.normalizePayload(raw);
    }
    parseJsonFileContent(utf8) {
        let raw;
        try {
            raw = JSON.parse(utf8);
        }
        catch (_a) {
            throw new common_1.BadRequestException('JSON file is not valid JSON');
        }
        return this.normalizePayload(raw);
    }
    normalizePayload(raw) {
        if (raw == null) {
            throw new common_1.BadRequestException('JSON payload is empty');
        }
        if (Array.isArray(raw)) {
            return { rows: raw.map((r) => this.coerceRow(r)) };
        }
        if (typeof raw === 'object' && raw !== null && 'rows' in raw) {
            const rowsVal = raw.rows;
            if (!Array.isArray(rowsVal)) {
                throw new common_1.BadRequestException('rows must be an array');
            }
            return { rows: rowsVal.map((r) => this.coerceRow(r)) };
        }
        return { rows: [this.coerceRow(raw)] };
    }
    tryParseEmbeddedJsonFromText(text) {
        if (text == null || text.trim() === '')
            return null;
        const trimmed = text.trim();
        const candidates = this.collectBalancedJsonSlices(trimmed);
        for (const slice of candidates) {
            let raw;
            try {
                raw = JSON.parse(slice);
            }
            catch (_a) {
                continue;
            }
            try {
                return this.normalizePayload(raw);
            }
            catch (_b) {
                continue;
            }
        }
        return null;
    }
    collectBalancedJsonSlices(text) {
        const out = new Set();
        out.add(text);
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (ch === '{' || ch === '[') {
                const end = this.findMatchingJsonBracketEnd(text, i);
                if (end !== -1)
                    out.add(text.slice(i, end + 1));
            }
        }
        return [...out];
    }
    findMatchingJsonBracketEnd(s, start) {
        const open = s[start];
        if (open !== '{' && open !== '[')
            return -1;
        const close = open === '{' ? '}' : ']';
        let depth = 0;
        let inString = false;
        let escape = false;
        for (let i = start; i < s.length; i++) {
            const ch = s[i];
            if (escape) {
                escape = false;
                continue;
            }
            if (ch === '\\' && inString) {
                escape = true;
                continue;
            }
            if (ch === '"') {
                inString = !inString;
                continue;
            }
            if (inString)
                continue;
            if (ch === open)
                depth++;
            else if (ch === close) {
                depth--;
                if (depth === 0)
                    return i;
            }
        }
        return -1;
    }
    coerceRow(obj) {
        if (typeof obj !== 'object' || obj === null) {
            throw new common_1.BadRequestException('Each row must be an object');
        }
        const row = (0, class_transformer_1.plainToInstance)(ingest_training_rows_dto_1.TrainingIngestRowDto, obj);
        return row;
    }
    async validateRows(rows) {
        const messages = [];
        let index = 0;
        for (const r of rows) {
            index++;
            const errs = await (0, class_validator_1.validate)(r);
            if (errs.length) {
                messages.push(`Row ${index}: ${formatValidationErrors(errs).join('; ')}`);
            }
        }
        return messages;
    }
    mergePayloads(filePayload, formPayload) {
        var _a, _b;
        if ((_a = formPayload === null || formPayload === void 0 ? void 0 : formPayload.rows) === null || _a === void 0 ? void 0 : _a.length)
            return formPayload.rows;
        if ((_b = filePayload === null || filePayload === void 0 ? void 0 : filePayload.rows) === null || _b === void 0 ? void 0 : _b.length)
            return filePayload.rows;
        return [];
    }
};
exports.TrainingMetadataParserService = TrainingMetadataParserService;
exports.TrainingMetadataParserService = TrainingMetadataParserService = __decorate([
    (0, common_1.Injectable)()
], TrainingMetadataParserService);
//# sourceMappingURL=training-metadata-parser.service.js.map
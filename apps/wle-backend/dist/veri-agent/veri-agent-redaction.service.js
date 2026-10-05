"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriAgentRedactionService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const PII_PATTERNS = [
    /\b[\w.+-]+@[\w.-]+\.\w{2,}\b/gi,
    /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    /\b\d{1,5}\s+(?:[A-Za-z0-9.'-]+\s+){0,4}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)\b\.?/gi,
    /\b(?:lat(?:itude)?|lon(?:gitude)?|gps)\s*[:=]?\s*-?\d{1,3}\.\d+\b/gi,
    /\b-?\d{1,2}\.\d{3,},\s*-?\d{1,3}\.\d{3,}\b/g,
];
const SENSITIVE_JSON_KEYS = new Set([
    'imagebase64',
    'image_base64',
    'photoBase64',
    'photobase64',
    'ssn',
    'sin',
    'password',
    'token',
    'accesstoken',
    'refreshtoken',
    'authorization',
    'email',
    'phone',
    'phonenumber',
    'mobile',
    'address',
    'homeaddress',
    'gps',
    'latitude',
    'longitude',
    'lat',
    'lng',
    'geolocation',
]);
let VeriAgentRedactionService = class VeriAgentRedactionService {
    redactText(text) {
        let out = text !== null && text !== void 0 ? text : '';
        for (const re of PII_PATTERNS) {
            out = out.replace(re, '[REDACTED]');
        }
        out = out.replace(/\b(witness|employee|worker|operator|supervisor)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g, '$1 [ROLE]');
        const stillLooksLikePhone = /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(out);
        const stillEmail = /@/.test(out) && /\.\w{2,}/.test(out);
        return { text: out, ok: !stillLooksLikePhone && !stillEmail };
    }
    redactJsonContext(value, depth = 0) {
        if (depth > 8)
            return '[TRUNCATED]';
        if (value == null)
            return value;
        if (typeof value === 'string') {
            return this.redactText(value).text.slice(0, 4000);
        }
        if (typeof value === 'number' || typeof value === 'boolean')
            return value;
        if (Array.isArray(value)) {
            return value.slice(0, 50).map((v) => this.redactJsonContext(v, depth + 1));
        }
        if (typeof value === 'object') {
            const out = {};
            for (const [k, v] of Object.entries(value)) {
                if (SENSITIVE_JSON_KEYS.has(k.toLowerCase())) {
                    out[k] = '[REDACTED]';
                    continue;
                }
                if (typeof v === 'string' &&
                    v.length > 200 &&
                    /^[A-Za-z0-9+/=\s]+$/.test(v.slice(0, 80)) &&
                    v.length > 5000) {
                    out[k] = '[REDACTED_MEDIA]';
                    continue;
                }
                out[k] = this.redactJsonContext(v, depth + 1);
            }
            return out;
        }
        return String(value);
    }
    hashForAudit(text) {
        return (0, crypto_1.createHash)('sha256').update(text).digest('hex').slice(0, 32);
    }
    sanitizeModelJson(data) {
        const walk = (node, depth) => {
            if (depth > 8 || node == null)
                return node;
            if (typeof node === 'string')
                return this.redactText(node).text;
            if (Array.isArray(node))
                return node.map((x) => walk(x, depth + 1));
            if (typeof node === 'object') {
                const o = {};
                for (const [k, v] of Object.entries(node)) {
                    if (SENSITIVE_JSON_KEYS.has(k.toLowerCase()))
                        continue;
                    o[k] = walk(v, depth + 1);
                }
                return o;
            }
            return node;
        };
        return walk(data, 0);
    }
};
exports.VeriAgentRedactionService = VeriAgentRedactionService;
exports.VeriAgentRedactionService = VeriAgentRedactionService = __decorate([
    (0, common_1.Injectable)()
], VeriAgentRedactionService);
//# sourceMappingURL=veri-agent-redaction.service.js.map
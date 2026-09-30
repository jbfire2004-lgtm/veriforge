"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecureDownloadToken = createSecureDownloadToken;
exports.verifySecureDownloadToken = verifySecureDownloadToken;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const SEP = '.';
function signPayload(encoded) {
    return crypto_1.default.createHmac('sha256', env_1.env.jwtAccessSecret).update(encoded).digest('base64url');
}
function createSecureDownloadToken(input) {
    const exp = Math.floor(Date.now() / 1000) + input.ttlSec;
    const payload = JSON.stringify({
        id: input.attachmentId,
        c: input.companyId,
        k: input.kind,
        exp,
    });
    const encoded = Buffer.from(payload).toString('base64url');
    const token = `${encoded}${SEP}${signPayload(encoded)}`;
    return { token, expiresAt: new Date(exp * 1000).toISOString() };
}
function verifySecureDownloadToken(token) {
    const [encoded, signature] = token.split(SEP);
    if (!encoded || !signature || signPayload(encoded) !== signature) {
        throw new Error('Invalid download token');
    }
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Download token expired');
    }
    return {
        attachmentId: payload.id,
        companyId: payload.c,
        kind: payload.k,
    };
}
//# sourceMappingURL=secure-token.js.map
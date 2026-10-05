"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finitePositiveInt = finitePositiveInt;
exports.parseWorkerPathId = parseWorkerPathId;
exports.parseTypedJsonQr = parseTypedJsonQr;
exports.parseCertificateToken = parseCertificateToken;
exports.parseEquipmentPathId = parseEquipmentPathId;
exports.parseCombinedUrlIds = parseCombinedUrlIds;
const common_1 = require("@nestjs/common");
function finitePositiveInt(v) {
    if (typeof v === 'number' && Number.isInteger(v) && v > 0)
        return v;
    if (typeof v === 'string' && /^\d+$/.test(v.trim())) {
        const n = parseInt(v.trim(), 10);
        return Number.isFinite(n) && n > 0 ? n : null;
    }
    return null;
}
function trySegment(path, marker) {
    const i = path.indexOf(marker);
    if (i < 0)
        return null;
    const rest = path.slice(i + marker.length).split(/[/?#]/)[0];
    return finitePositiveInt(rest);
}
function parseWorkerPathId(qr) {
    const trimmed = qr.trim();
    const fromPath = (path) => {
        var _a, _b, _c, _d;
        if (path.includes('/verify/equipment'))
            return null;
        if (path.includes('/verify/t/') || path.includes('/verify/token/'))
            return null;
        return ((_d = (_c = (_b = (_a = trySegment(path, '/worker/')) !== null && _a !== void 0 ? _a : trySegment(path, '/public/worker/')) !== null && _b !== void 0 ? _b : trySegment(path, '/verify/')) !== null && _c !== void 0 ? _c : trySegment(path, '/wallet/')) !== null && _d !== void 0 ? _d : trySegment(path, '/scan/worker/'));
    };
    try {
        if (trimmed.includes('://')) {
            const url = new URL(trimmed);
            return fromPath(url.pathname);
        }
    }
    catch (_a) {
        return null;
    }
    return fromPath(trimmed);
}
function parseTypedJsonQr(qr) {
    const t = qr.trim();
    if (!t.startsWith('{'))
        return null;
    let data;
    try {
        data = JSON.parse(t);
    }
    catch (_a) {
        throw new common_1.BadRequestException('Malformed JSON QR payload');
    }
    if (typeof data !== 'object' ||
        data === null ||
        !('type' in data) ||
        typeof data.type !== 'string') {
        throw new common_1.BadRequestException('Unsupported JSON QR payload shape');
    }
    const { type } = data;
    if (type !== 'worker' && type !== 'equipment') {
        throw new common_1.BadRequestException('Unsupported JSON QR type');
    }
    const tokenRaw = data.token;
    const token = typeof tokenRaw === 'string' && tokenRaw.trim().length >= 20
        ? tokenRaw.trim()
        : undefined;
    const id = finitePositiveInt(data.id);
    if (id === null && !token) {
        throw new common_1.BadRequestException(`Invalid "${type}" token or id in JSON QR`);
    }
    return { kind: type, id: id !== null && id !== void 0 ? id : 0, token };
}
function parseCertificateToken(qr) {
    var _a;
    const t = qr.trim();
    const markers = [
        '/verify/certificate/',
        '/certificates/validate/',
        '/training-providers/certificates/validate/',
    ];
    for (const m of markers) {
        const i = t.indexOf(m);
        if (i >= 0) {
            const rest = (_a = t
                .slice(i + m.length)
                .split(/[/?#]/)[0]) === null || _a === void 0 ? void 0 : _a.trim();
            if (rest && /^cert_[a-f0-9]+$/i.test(rest))
                return rest;
            if (rest && rest.length >= 8)
                return rest;
        }
    }
    if (/^cert_[a-f0-9]+$/i.test(t))
        return t;
    return null;
}
function parseEquipmentPathId(qr) {
    var _a;
    const trimmed = qr.trim();
    try {
        if (trimmed.includes('://') || trimmed.startsWith('/')) {
            const href = trimmed.includes('://')
                ? trimmed
                : `https://vera.placeholder${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
            const url = new URL(href);
            if (url.pathname.includes('/verify/equipment')) {
                return finitePositiveInt(url.searchParams.get('id'));
            }
            return ((_a = trySegment(url.pathname, '/scan/equipment/')) !== null && _a !== void 0 ? _a : trySegment(url.pathname, '/equipment/'));
        }
    }
    catch (_b) {
        return null;
    }
    return trySegment(trimmed, '/scan/equipment/');
}
function parseCombinedUrlIds(qr) {
    const t = qr.trim();
    try {
        const href = t.includes('://')
            ? t
            : `https://vera.placeholder${t.startsWith('/') ? '' : '/'}${t}`;
        const url = new URL(href);
        const w = finitePositiveInt(url.searchParams.get('worker'));
        const e = finitePositiveInt(url.searchParams.get('equipment'));
        if (w !== null && e !== null)
            return { workerId: w, equipmentId: e };
        return null;
    }
    catch (_a) {
        return null;
    }
}
//# sourceMappingURL=qr-parse.util.js.map
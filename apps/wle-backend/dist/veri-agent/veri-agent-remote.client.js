"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VeriAgentRemoteClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeriAgentRemoteClient = void 0;
exports.isRemoteTransportError = isRemoteTransportError;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
let VeriAgentRemoteClient = VeriAgentRemoteClient_1 = class VeriAgentRemoteClient {
    constructor() {
        this.logger = new common_1.Logger(VeriAgentRemoteClient_1.name);
    }
    isEnabled() {
        return Boolean(this.baseUrl());
    }
    isStrict() {
        var _a;
        const v = ((_a = process.env.VERA_AGENT_REMOTE_STRICT) !== null && _a !== void 0 ? _a : '').toLowerCase();
        return v === '1' || v === 'true' || v === 'on';
    }
    async completeJson(req) {
        return this.postComplete('/v1/invoke', {
            purpose: req.purpose,
            tenant: req.tenant,
            actor: req.actor
                ? {
                    userId: req.actor.userId,
                    role: req.actor.role,
                    companyId: req.actor.companyId,
                }
                : undefined,
            messages: req.messages,
            temperature: req.temperature,
            model: req.model,
            requireCleanRedaction: req.requireCleanRedaction,
        });
    }
    async completeMultimodalJson(req) {
        return this.postComplete('/v1/invoke/multimodal', {
            purpose: req.purpose,
            tenant: req.tenant,
            actor: req.actor
                ? {
                    userId: req.actor.userId,
                    role: req.actor.role,
                    companyId: req.actor.companyId,
                }
                : undefined,
            system: req.system,
            userText: req.userText,
            imageBase64: req.imageBase64,
            imageMimeType: req.imageMimeType,
            temperature: req.temperature,
            model: req.model,
            requireCleanRedaction: req.requireCleanRedaction,
        });
    }
    async embed(req) {
        const base = this.baseUrl();
        if (!base) {
            return { kind: 'transport', message: 'remote_url_unset' };
        }
        const token = this.serviceToken(req.tenant.companyId);
        if (!token) {
            return { kind: 'transport', message: 'missing_service_token' };
        }
        try {
            const res = await fetch(`${base}/v1/embed`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    purpose: req.purpose,
                    tenant: req.tenant,
                    actor: req.actor,
                    text: req.text,
                    model: req.model,
                    requireCleanRedaction: req.requireCleanRedaction,
                }),
            });
            if (res.status >= 500 || res.status === 429) {
                return {
                    kind: 'transport',
                    status: res.status,
                    message: `remote_http_${res.status}`,
                };
            }
            if (res.status === 401 || res.status === 403) {
                return {
                    kind: 'transport',
                    status: res.status,
                    message: `remote_auth_${res.status}`,
                };
            }
            const json = (await res.json());
            if (json && typeof json === 'object' && typeof json.ok === 'boolean') {
                return json;
            }
            return { kind: 'transport', message: 'remote_unexpected_shape' };
        }
        catch (e) {
            return {
                kind: 'transport',
                message: e instanceof Error ? e.message : 'fetch_failed',
            };
        }
    }
    baseUrl() {
        var _a;
        return ((_a = process.env.VERA_AGENT_REMOTE_URL) !== null && _a !== void 0 ? _a : '').replace(/\/$/, '');
    }
    serviceToken(companyId) {
        var _a, _b, _c;
        const secret = ((_a = process.env.VERA_AGENT_JWT_SECRET) === null || _a === void 0 ? void 0 : _a.trim()) ||
            ((_b = process.env.JWT_SECRET) === null || _b === void 0 ? void 0 : _b.trim());
        const isProd = process.env.NODE_ENV === 'production';
        if (secret && companyId != null && Number.isFinite(companyId)) {
            const issuer = process.env.VERA_AGENT_JWT_ISSUER || process.env.JWT_ISSUER || 'veriforge';
            const audience = process.env.VERA_AGENT_JWT_AUDIENCE ||
                process.env.JWT_AUDIENCE_VERI_AGENT ||
                'veri-agent';
            return jwt.sign({
                sub: 'nest-veri-agent',
                companyId,
            }, secret, {
                algorithm: 'HS256',
                issuer,
                audience,
                expiresIn: '5m',
            });
        }
        const staticToken = (_c = process.env.VERA_AGENT_SERVICE_TOKEN) === null || _c === void 0 ? void 0 : _c.trim();
        if (staticToken && !isProd) {
            return staticToken;
        }
        return null;
    }
    async postComplete(path, body) {
        const base = this.baseUrl();
        if (!base) {
            return { kind: 'transport', message: 'remote_url_unset' };
        }
        const tenant = body.tenant;
        const token = this.serviceToken(tenant === null || tenant === void 0 ? void 0 : tenant.companyId);
        if (!token) {
            this.logger.warn('VeriAgent remote enabled but no VERA_AGENT_SERVICE_TOKEN / JWT_SECRET');
            return { kind: 'transport', message: 'missing_service_token' };
        }
        try {
            const res = await fetch(`${base}${path}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (res.status >= 500 || res.status === 429) {
                return {
                    kind: 'transport',
                    status: res.status,
                    message: `remote_http_${res.status}`,
                };
            }
            if (res.status === 401 || res.status === 403) {
                return {
                    kind: 'transport',
                    status: res.status,
                    message: `remote_auth_${res.status}`,
                };
            }
            let json;
            try {
                json = await res.json();
            }
            catch (_a) {
                return {
                    kind: 'transport',
                    status: res.status,
                    message: 'remote_invalid_json',
                };
            }
            if (json &&
                typeof json === 'object' &&
                'ok' in json &&
                typeof json.ok === 'boolean') {
                return json;
            }
            return {
                kind: 'transport',
                status: res.status,
                message: 'remote_unexpected_shape',
            };
        }
        catch (e) {
            return {
                kind: 'transport',
                message: e instanceof Error ? e.message : 'fetch_failed',
            };
        }
    }
};
exports.VeriAgentRemoteClient = VeriAgentRemoteClient;
exports.VeriAgentRemoteClient = VeriAgentRemoteClient = VeriAgentRemoteClient_1 = __decorate([
    (0, common_1.Injectable)()
], VeriAgentRemoteClient);
function isRemoteTransportError(v) {
    return (!!v &&
        typeof v === 'object' &&
        v.kind === 'transport');
}
//# sourceMappingURL=veri-agent-remote.client.js.map
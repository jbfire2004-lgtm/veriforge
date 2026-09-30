"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authIntrospection = void 0;
const lru_cache_1 = require("lru-cache");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const cache = new lru_cache_1.LRUCache({
    max: env_1.env.tokenCacheMax,
    ttl: env_1.env.tokenCacheTtlMs,
});
exports.authIntrospection = {
    async validateToken(token) {
        const cached = cache.get(token);
        if (cached && cached.expiresAt > Date.now() / 1000) {
            return cached.payload;
        }
        const payload = await this.introspectRemote(token);
        const exp = payload.exp ?? Math.floor(Date.now() / 1000) + 900;
        cache.set(token, { payload, expiresAt: exp });
        return payload;
    },
    async introspectRemote(token) {
        const url = `${env_1.env.authServiceUrl}${env_1.env.authValidatePath}?token=${encodeURIComponent(token)}`;
        try {
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
                signal: AbortSignal.timeout(5000),
            });
            const body = (await res.json());
            if (body.valid && body.payload?.user_id && body.payload?.company_id) {
                return body.payload;
            }
        }
        catch (err) {
            logger_1.logger.warn('auth introspection failed', {
                error: err instanceof Error ? err.message : String(err),
            });
        }
        if (env_1.env.jwtAccessSecret) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtAccessSecret);
                return {
                    user_id: decoded.user_id ?? decoded.sub,
                    company_id: decoded.company_id,
                    email: decoded.email,
                    roles: decoded.roles,
                    exp: decoded.exp,
                };
            }
            catch {
                /* fall through */
            }
        }
        throw new errors_1.UnauthorizedError('Invalid or expired token');
    },
};
//# sourceMappingURL=auth-introspection.service.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAuthOrDownloadToken = requireAuthOrDownloadToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const secure_token_1 = require("../utils/secure-token");
async function requireAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return next(new errors_1.UnauthorizedError('Bearer token required'));
    }
    const token = header.slice(7);
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.jwtAccessSecret);
        req.auth = payload;
        req.userId = payload.user_id;
        req.companyId = payload.company_id;
        return next();
    }
    catch {
        if (env_1.env.authValidateUrl) {
            try {
                const res = await fetch(`${env_1.env.authValidateUrl}?token=${encodeURIComponent(token)}`, { headers: { Authorization: `Bearer ${token}` } });
                const body = (await res.json());
                if (body.valid && body.payload) {
                    req.auth = body.payload;
                    req.userId = body.payload.user_id;
                    req.companyId = body.payload.company_id;
                    return next();
                }
            }
            catch {
                /* fall through */
            }
        }
        return next(new errors_1.UnauthorizedError('Invalid or expired token'));
    }
}
function requireAuthOrDownloadToken(expectedKind) {
    return (req, _res, next) => {
        const token = req.query.token;
        if (token) {
            try {
                const payload = (0, secure_token_1.verifySecureDownloadToken)(token);
                if (payload.kind !== expectedKind) {
                    return next(new errors_1.UnauthorizedError('Invalid download token type'));
                }
                req.downloadToken = payload;
                req.companyId = payload.companyId;
                return next();
            }
            catch {
                return next(new errors_1.UnauthorizedError('Invalid or expired download token'));
            }
        }
        return requireAuth(req, _res, next);
    };
}
//# sourceMappingURL=auth.middleware.js.map
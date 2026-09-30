"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireSupervisor = requireSupervisor;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
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
function requireSupervisor(req, _res, next) {
    const roles = req.auth?.roles ?? [];
    const allowed = ['supervisor', 'project_manager', 'company_admin', 'admin'];
    if (!roles.some((r) => allowed.includes(r.toLowerCase()))) {
        return next(new errors_1.UnauthorizedError('Supervisor role required'));
    }
    return next();
}

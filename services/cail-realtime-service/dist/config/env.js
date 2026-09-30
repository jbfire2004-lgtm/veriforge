"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function required(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing required environment variable: ${name}`);
    return v;
}
exports.env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3027),
    databaseUrl: required('DATABASE_URL'),
    jwtAccessSecret: required('JWT_ACCESS_SECRET'),
    authValidateUrl: process.env.AUTH_VALIDATE_URL,
    defaultModelId: process.env.DEFAULT_MODEL_ID ?? 'deterministic_rules_v1',
    defaultModelVersion: Number(process.env.DEFAULT_MODEL_VERSION ?? 1),
    modelCacheTtlMs: Number(process.env.MODEL_CACHE_TTL_MS ?? 300_000),
    logLevel: process.env.LOG_LEVEL ?? 'info',
    corsOrigin: process.env.CORS_ORIGIN ?? '*',
};

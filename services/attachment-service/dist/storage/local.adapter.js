"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageAdapter = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
class LocalStorageAdapter {
    rootDir;
    constructor(rootDir) {
        this.rootDir = rootDir;
    }
    resolveKey(key) {
        const normalized = path_1.default.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '');
        return path_1.default.join(this.rootDir, normalized);
    }
    async putObject(key, body, _contentType) {
        const filePath = this.resolveKey(key);
        await promises_1.default.mkdir(path_1.default.dirname(filePath), { recursive: true });
        await promises_1.default.writeFile(filePath, body);
        return { key, size: body.length };
    }
    async getObject(key) {
        const filePath = this.resolveKey(key);
        const body = await promises_1.default.readFile(filePath);
        return { body };
    }
    async exists(key) {
        try {
            await promises_1.default.access(this.resolveKey(key));
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Local dev: presigned URLs are gateway-proxied download paths with HMAC token.
     * Production should use S3 adapter for true pre-signing.
     */
    async getPresignedUrl(key, ttlSec) {
        const expiresAt = new Date(Date.now() + ttlSec * 1000).toISOString();
        const url = `file://${path_1.default.join(this.rootDir, key)}`;
        void env_1.env;
        return { url, expiresAt };
    }
}
exports.LocalStorageAdapter = LocalStorageAdapter;
//# sourceMappingURL=local.adapter.js.map
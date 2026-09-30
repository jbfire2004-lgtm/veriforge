"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenizeProjectId = tokenizeProjectId;
exports.tokenizeCompanyId = tokenizeCompanyId;
exports.tokenizeEntityId = tokenizeEntityId;
exports.isProjectToken = isProjectToken;
exports.isCompanyToken = isCompanyToken;
exports.assertTokenNotInPublicPayload = assertTokenNotInPublicPayload;
const node_crypto_1 = require("node:crypto");
const DEFAULT_PROJECT_SALT = "visi-project-v1";
const DEFAULT_COMPANY_SALT = "visi-company-v1";
function sha16(input) {
    return (0, node_crypto_1.createHash)("sha256").update(input).digest("hex").slice(0, 16);
}
/**
 * Tokenize project IDs → `proj_{hex}`
 * Salt is plane-specific so the same numeric id cannot link to a company token.
 */
function tokenizeProjectId(projectId, salt = process.env.VISI_PROJECT_SALT ?? DEFAULT_PROJECT_SALT) {
    return `proj_${sha16(`${salt}:${projectId}`)}`;
}
/**
 * Tokenize company IDs → `co_{hex}`
 */
function tokenizeCompanyId(companyId, salt = process.env.VISI_COMPANY_SALT ?? DEFAULT_COMPANY_SALT) {
    return `co_${sha16(`${salt}:${companyId}`)}`;
}
function tokenizeEntityId(entityType, id, options) {
    return entityType === "project"
        ? tokenizeProjectId(id, options?.projectSalt)
        : tokenizeCompanyId(id, options?.companySalt);
}
function isProjectToken(token) {
    return token.startsWith("proj_");
}
function isCompanyToken(token) {
    return token.startsWith("co_");
}
/** Tokens must never be returned in Hub API responses */
function assertTokenNotInPublicPayload(payload) {
    const json = JSON.stringify(payload);
    if (/"proj_[a-f0-9]{16}"/.test(json) || /"co_[a-f0-9]{16}"/.test(json)) {
        throw new Error("VISI_TOKEN_LEAK: entity tokens must not appear in public payloads");
    }
}

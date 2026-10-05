"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDocumentStorageRecord = toDocumentStorageRecord;
function toDocumentStorageRecord(row) {
    var _a, _b;
    const uploadedAt = (_a = row.completedAt) !== null && _a !== void 0 ? _a : row.createdAt;
    return {
        file_id: row.id,
        file_name: row.originalName,
        file_type: row.mimeType,
        uploaded_by: row.user
            ? {
                id: row.user.id,
                email: row.user.email,
                companyId: row.user.companyId,
            }
            : null,
        uploaded_at: typeof uploadedAt === 'string'
            ? uploadedAt
            : uploadedAt.toISOString(),
        purpose: row.purpose,
        linked_project_id: (_b = row.projectId) !== null && _b !== void 0 ? _b : null,
    };
}
//# sourceMappingURL=document-storage.schema.js.map
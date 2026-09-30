"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentEngine = exports.AttachmentEngine = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class AttachmentEngine {
    async registerEvidence(input) {
        if (input.attachment.storageKey) {
            return { storageKey: input.attachment.storageKey, registered: true };
        }
        if (!env_1.env.attachmentServiceUrl || !input.attachment.dataUrl) {
            return { registered: false };
        }
        try {
            const res = await fetch(env_1.env.attachmentServiceUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_id: input.companyId,
                    source_type: 'corrective_action',
                    source_id: input.correctiveActionId,
                    file_name: input.attachment.fileName,
                    mime_type: input.attachment.mimeType,
                    data_url: input.attachment.dataUrl,
                    phase: input.attachment.phase ?? 'evidence',
                }),
            });
            if (!res.ok) {
                logger_1.logger.warn('attachment service registration failed', {
                    correctiveActionId: input.correctiveActionId,
                    status: res.status,
                });
                return { registered: false };
            }
            const body = (await res.json());
            return { storageKey: body.storage_key ?? body.id, registered: true };
        }
        catch (err) {
            logger_1.logger.warn('attachment service unavailable', {
                correctiveActionId: input.correctiveActionId,
                error: err instanceof Error ? err.message : String(err),
            });
            return { registered: false };
        }
    }
}
exports.AttachmentEngine = AttachmentEngine;
exports.attachmentEngine = new AttachmentEngine();

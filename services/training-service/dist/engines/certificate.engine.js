"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.certificateEngine = exports.CertificateEngine = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class CertificateEngine {
    async register(input) {
        if (input.certificatePath)
            return input.certificatePath;
        if (!input.dataUrl)
            return undefined;
        if (!env_1.env.attachmentServiceUrl) {
            return input.dataUrl.length > 500 ? `${input.dataUrl.slice(0, 500)}...` : input.dataUrl;
        }
        try {
            const res = await fetch(env_1.env.attachmentServiceUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_id: input.companyId,
                    source_type: 'training_certificate',
                    source_id: input.workerId,
                    file_name: input.fileName ?? `cert-${input.courseId}`,
                    data_url: input.dataUrl,
                }),
            });
            if (!res.ok) {
                logger_1.logger.warn('certificate upload failed', { status: res.status });
                return input.dataUrl;
            }
            const body = (await res.json());
            return body.storage_key ?? body.path ?? input.dataUrl;
        }
        catch (err) {
            logger_1.logger.warn('attachment service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return input.dataUrl;
        }
    }
}
exports.CertificateEngine = CertificateEngine;
exports.certificateEngine = new CertificateEngine();

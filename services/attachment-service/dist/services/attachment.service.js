"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentService = void 0;
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const attachment_repository_1 = require("../models/attachment.repository");
const storage_factory_1 = require("../storage/storage.factory");
const file_validation_engine_1 = require("../engines/file-validation.engine");
const thumbnail_engine_1 = require("../engines/thumbnail.engine");
const virus_scan_hook_1 = require("../engines/virus-scan.hook");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const secure_token_1 = require("../utils/secure-token");
const logger_1 = require("../utils/logger");
function buildStorageKey(companyId, moduleType, attachmentId, fileName) {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return path_1.default.posix.join(companyId, moduleType, attachmentId, safeName);
}
exports.attachmentService = {
    assertCompanyAccess(tokenCompanyId, requestedCompanyId) {
        if (tokenCompanyId !== requestedCompanyId) {
            throw new errors_1.ForbiddenError('Cross-company access denied');
        }
    },
    async upload(input) {
        const validation = file_validation_engine_1.fileValidationEngine.validate({
            mimeType: input.mimeType,
            fileName: input.fileName,
            fileSize: input.buffer.length,
        });
        if (!validation.ok) {
            throw new errors_1.BadRequestError(validation.errors.join('; '));
        }
        const attachmentId = (0, crypto_1.randomUUID)();
        const storageKey = buildStorageKey(input.companyId, input.moduleType, attachmentId, input.fileName);
        const storage = (0, storage_factory_1.getStorageAdapter)();
        await storage.putObject(storageKey, input.buffer, input.mimeType);
        const scan = await (0, virus_scan_hook_1.runVirusScanHook)({
            attachmentId,
            companyId: input.companyId,
            filePath: storageKey,
            fileType: input.mimeType,
            fileSize: input.buffer.length,
        });
        if (!scan.clean) {
            logger_1.logger.warn('virus scan rejected file', { attachmentId, reason: scan.reason });
            throw new errors_1.UnprocessableError(scan.reason ?? 'File rejected by virus scan');
        }
        let thumbnailPath;
        if (file_validation_engine_1.fileValidationEngine.isImageMime(input.mimeType)) {
            const thumbBuffer = await thumbnail_engine_1.thumbnailEngine.generate(input.buffer);
            if (thumbBuffer) {
                thumbnailPath = buildStorageKey(input.companyId, input.moduleType, attachmentId, 'thumbnail.jpg');
                await storage.putObject(thumbnailPath, thumbBuffer, 'image/jpeg');
            }
        }
        const row = await attachment_repository_1.attachmentRepository.create({
            id: attachmentId,
            companyId: input.companyId,
            projectId: input.projectId,
            moduleType: input.moduleType,
            moduleRecordId: input.moduleRecordId,
            filePath: storageKey,
            fileType: input.mimeType,
            fileSize: input.buffer.length,
            thumbnailPath,
            uploadedBy: input.uploadedBy,
        });
        logger_1.logger.info('attachment uploaded', { attachmentId: row.id, companyId: input.companyId });
        return this.withSecureUrls(attachment_repository_1.attachmentRepository.toDto(row), row.filePath, row.thumbnailPath);
    },
    async getMetadata(companyId, id, includeUrls) {
        const row = await attachment_repository_1.attachmentRepository.findById(id, companyId);
        if (!row)
            throw new errors_1.NotFoundError('Attachment not found');
        const dto = attachment_repository_1.attachmentRepository.toDto(row);
        if (!includeUrls)
            return dto;
        return this.withSecureUrls(dto, row.filePath, row.thumbnailPath);
    },
    async getFileStream(companyId, id, kind) {
        const row = await attachment_repository_1.attachmentRepository.findById(id, companyId);
        if (!row)
            throw new errors_1.NotFoundError('Attachment not found');
        const key = kind === 'thumbnail' ? row.thumbnailPath : row.filePath;
        if (!key)
            throw new errors_1.NotFoundError('Thumbnail not available');
        const storage = (0, storage_factory_1.getStorageAdapter)();
        const object = await storage.getObject(key);
        const contentType = kind === 'thumbnail' ? 'image/jpeg' : row.fileType;
        return { buffer: object.body, contentType, fileName: path_1.default.basename(row.filePath) };
    },
    async withSecureUrls(dto, filePath, thumbnailPath) {
        const storage = (0, storage_factory_1.getStorageAdapter)();
        const ttl = env_1.env.presignedUrlTtlSec;
        const publicBase = process.env.ATTACHMENT_PUBLIC_URL ?? `http://localhost:${env_1.env.port}`;
        let downloadUrl;
        let downloadUrlExpiresAt;
        if (env_1.env.storageDriver === 's3') {
            const signed = await storage.getPresignedUrl(filePath, ttl);
            downloadUrl = signed.url;
            downloadUrlExpiresAt = signed.expiresAt;
        }
        else {
            const token = (0, secure_token_1.createSecureDownloadToken)({
                attachmentId: dto.id,
                companyId: dto.companyId,
                kind: 'file',
                ttlSec: ttl,
            });
            downloadUrl = `${publicBase}/attachment/${dto.id}/download?token=${token.token}`;
            downloadUrlExpiresAt = token.expiresAt;
        }
        let thumbnailUrl;
        let thumbnailUrlExpiresAt;
        if (thumbnailPath) {
            if (env_1.env.storageDriver === 's3') {
                const signed = await storage.getPresignedUrl(thumbnailPath, ttl);
                thumbnailUrl = signed.url;
                thumbnailUrlExpiresAt = signed.expiresAt;
            }
            else {
                const token = (0, secure_token_1.createSecureDownloadToken)({
                    attachmentId: dto.id,
                    companyId: dto.companyId,
                    kind: 'thumbnail',
                    ttlSec: ttl,
                });
                thumbnailUrl = `${publicBase}/attachment/${dto.id}/thumbnail?token=${token.token}`;
                thumbnailUrlExpiresAt = token.expiresAt;
            }
        }
        return {
            ...dto,
            downloadUrl,
            downloadUrlExpiresAt,
            thumbnailUrl,
            thumbnailUrlExpiresAt,
        };
    },
};
//# sourceMappingURL=attachment.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CoreUploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreUploadService = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const prisma_service_1 = require("../../prisma/prisma.service");
const phase1_monitoring_service_1 = require("../../common/monitoring/phase1-monitoring.service");
const core_upload_config_1 = require("./core-upload.config");
const core_file_purposes_1 = require("./core-file-purposes");
let CoreUploadService = CoreUploadService_1 = class CoreUploadService {
    constructor(prisma, monitoring) {
        this.prisma = prisma;
        this.monitoring = monitoring;
        this.logger = new common_1.Logger(CoreUploadService_1.name);
        this.s3 = null;
    }
    getS3() {
        if (!this.s3) {
            const { awsRegion } = (0, core_upload_config_1.getCoreUploadConfig)();
            if (!awsRegion) {
                throw new common_1.ServiceUnavailableException('S3 is not configured (set AWS_REGION)');
            }
            this.s3 = new client_s3_1.S3Client({ region: awsRegion });
        }
        return this.s3;
    }
    requireAwsBucket() {
        const { awsBucket } = (0, core_upload_config_1.getCoreUploadConfig)();
        if (!awsBucket) {
            throw new common_1.ServiceUnavailableException('S3 bucket not configured (set AWS_S3_BUCKET or VERA_S3_BUCKET)');
        }
        return awsBucket;
    }
    getPublicConfig() {
        const cfg = (0, core_upload_config_1.getCoreUploadConfig)();
        return {
            mode: cfg.mode,
            maxBytes: cfg.maxBytes,
            allowedMimeTypes: [...cfg.allowedMimeTypes],
        };
    }
    listPurposes() {
        return core_file_purposes_1.CORE_FILE_PURPOSES.map((value) => ({
            value,
            label: core_file_purposes_1.CORE_FILE_PURPOSE_LABELS[value],
        }));
    }
    assertMimeAllowed(mime) {
        const { allowedMimeTypes } = (0, core_upload_config_1.getCoreUploadConfig)();
        if (!allowedMimeTypes.has(mime)) {
            throw new common_1.BadRequestException(`File type not allowed: ${mime}. Allowed: ${[...allowedMimeTypes].join(', ')}`);
        }
    }
    assertSizeAllowed(size) {
        const { maxBytes } = (0, core_upload_config_1.getCoreUploadConfig)();
        if (size > maxBytes) {
            throw new common_1.BadRequestException(`File too large (max ${maxBytes} bytes / ${Math.round(maxBytes / (1024 * 1024))} MiB)`);
        }
    }
    makeObjectKey(originalName) {
        const safe = (0, path_1.basename)(originalName || 'file').replace(/[^\w.\-]+/g, '_');
        return `core/${(0, crypto_1.randomUUID)()}_${safe}`;
    }
    localDiskPath(objectKey) {
        return (0, path_1.join)(process.cwd(), 'uploads', objectKey);
    }
    localPublicUrl(objectKey) {
        var _a;
        const base = ((_a = process.env.PUBLIC_API_URL) === null || _a === void 0 ? void 0 : _a.replace(/\/$/, '')) || 'http://localhost:3001';
        const encoded = objectKey.split('/').map(encodeURIComponent).join('/');
        return `${base}/uploads/${encoded}`;
    }
    s3PublicUrl(objectKey) {
        const cfg = (0, core_upload_config_1.getCoreUploadConfig)();
        if (cfg.publicAssetBase) {
            return `${cfg.publicAssetBase}/${objectKey
                .split('/')
                .map(encodeURIComponent)
                .join('/')}`;
        }
        const bucket = this.requireAwsBucket();
        const region = cfg.awsRegion;
        const encoded = objectKey.split('/').map(encodeURIComponent).join('/');
        return `https://${bucket}.s3.${region}.amazonaws.com/${encoded}`;
    }
    toResponse(row) {
        var _a, _b, _c, _d, _e, _f;
        const uploadedAt = (_a = row.completedAt) !== null && _a !== void 0 ? _a : row.createdAt;
        return {
            id: row.id,
            storage: row.storage,
            status: row.status,
            objectKey: row.objectKey,
            originalName: row.originalName,
            mimeType: row.mimeType,
            sizeBytes: row.sizeBytes,
            publicUrl: row.publicUrl,
            purpose: row.purpose,
            companyId: (_b = row.companyId) !== null && _b !== void 0 ? _b : null,
            userId: (_c = row.userId) !== null && _c !== void 0 ? _c : null,
            projectId: (_d = row.projectId) !== null && _d !== void 0 ? _d : null,
            file_id: row.id,
            file_name: row.originalName,
            file_type: row.mimeType,
            uploaded_by: (_e = row.userId) !== null && _e !== void 0 ? _e : null,
            uploaded_at: uploadedAt,
            linked_project_id: (_f = row.projectId) !== null && _f !== void 0 ? _f : null,
            createdAt: row.createdAt,
            completedAt: row.completedAt,
        };
    }
    ownershipData(ownership) {
        var _a, _b, _c;
        return {
            userId: (_a = ownership === null || ownership === void 0 ? void 0 : ownership.userId) !== null && _a !== void 0 ? _a : null,
            companyId: (_b = ownership === null || ownership === void 0 ? void 0 : ownership.companyId) !== null && _b !== void 0 ? _b : null,
            projectId: (_c = ownership === null || ownership === void 0 ? void 0 : ownership.projectId) !== null && _c !== void 0 ? _c : null,
        };
    }
    async findOne(id) {
        const row = await this.prisma.coreFile.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Core file not found');
        return this.toResponse(row);
    }
    async readBuffer(id) {
        var _a;
        const row = await this.prisma.coreFile.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Core file not found');
        if (row.status !== client_1.CoreUploadStatus.COMPLETED) {
            throw new common_1.BadRequestException('Upload is not complete');
        }
        if (row.storage === client_1.CoreUploadStorage.LOCAL) {
            const diskPath = this.localDiskPath(row.objectKey);
            const buffer = await (0, promises_1.readFile)(diskPath);
            return {
                buffer,
                mimeType: row.mimeType,
                originalName: row.originalName,
            };
        }
        const bucket = (_a = row.bucket) !== null && _a !== void 0 ? _a : (row.storage === client_1.CoreUploadStorage.S3 ||
            row.storage === client_1.CoreUploadStorage.DIRECT_S3
            ? this.requireAwsBucket()
            : null);
        if (!bucket) {
            throw new common_1.ServiceUnavailableException('Cannot resolve storage bucket');
        }
        const result = await this.getS3().send(new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: row.objectKey }));
        if (!result.Body) {
            throw new common_1.NotFoundException('Object body empty in storage');
        }
        const buffer = Buffer.from(await result.Body.transformToByteArray());
        return {
            buffer,
            mimeType: row.mimeType,
            originalName: row.originalName,
        };
    }
    async abandonDirectUpload(id) {
        const cfg = (0, core_upload_config_1.getCoreUploadConfig)();
        if (cfg.mode !== 'direct') {
            throw new common_1.BadRequestException('abandon is only used in direct mode');
        }
        const row = await this.prisma.coreFile.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Core file not found');
        if (row.status !== client_1.CoreUploadStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending direct uploads can be abandoned');
        }
        if (row.storage !== client_1.CoreUploadStorage.DIRECT_S3 || !row.bucket) {
            throw new common_1.BadRequestException('Invalid direct upload record');
        }
        try {
            await this.getS3().send(new client_s3_1.DeleteObjectCommand({ Bucket: row.bucket, Key: row.objectKey }));
        }
        catch (e) {
            this.logger.warn(`abandon: could not delete S3 object ${row.objectKey}: ${e instanceof Error ? e.message : String(e)}`);
        }
        await this.prisma.coreFile.update({
            where: { id },
            data: {
                status: client_1.CoreUploadStatus.FAILED,
                failedReason: 'abandoned_by_client',
            },
        });
        this.monitoring.processing('core_upload', 'direct.abandon', {
            coreFileId: id,
        });
        return { id, status: 'FAILED' };
    }
    async handleMultipartUpload(file, purpose, ownership) {
        var _a, _b;
        const purposeNorm = (0, core_file_purposes_1.normalizeCoreFilePurpose)(purpose);
        this.logger.log(JSON.stringify({
            type: 'core_upload.multipart.start',
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            purpose: purposeNorm,
            companyId: (_a = ownership === null || ownership === void 0 ? void 0 : ownership.companyId) !== null && _a !== void 0 ? _a : null,
            userId: (_b = ownership === null || ownership === void 0 ? void 0 : ownership.userId) !== null && _b !== void 0 ? _b : null,
        }));
        const cfg = (0, core_upload_config_1.getCoreUploadConfig)();
        if (cfg.mode === 'direct') {
            throw new common_1.BadRequestException('Server is in direct mode: use POST /presign, PUT file to the signed URL, then POST /complete');
        }
        this.assertMimeAllowed(file.mimetype);
        this.assertSizeAllowed(file.size);
        this.monitoring.processing('core_upload', 'multipart.accepted', {
            mode: cfg.mode,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            purpose: purposeNorm,
        });
        const objectKey = this.makeObjectKey(file.originalname);
        const owner = this.ownershipData(ownership);
        if (cfg.mode === 'local') {
            const diskPath = this.localDiskPath(objectKey);
            await (0, promises_1.mkdir)((0, path_1.dirname)(diskPath), { recursive: true });
            await (0, promises_1.writeFile)(diskPath, new Uint8Array(file.buffer));
            const publicUrl = this.localPublicUrl(objectKey);
            try {
                const row = await this.prisma.coreFile.create({
                    data: Object.assign({ storage: client_1.CoreUploadStorage.LOCAL, status: client_1.CoreUploadStatus.COMPLETED, bucket: null, objectKey, originalName: file.originalname, mimeType: file.mimetype, sizeBytes: file.size, publicUrl, purpose: purposeNorm, completedAt: new Date() }, owner),
                });
                await this.prisma.auditLog.create({
                    data: {
                        action: 'core_file.uploaded',
                        entityType: 'CoreFile',
                        entityId: String(row.id),
                        metadataJson: {
                            mode: 'local',
                            objectKey: row.objectKey,
                            mimeType: row.mimeType,
                            sizeBytes: row.sizeBytes,
                            purpose: purposeNorm,
                            companyId: owner.companyId,
                        },
                    },
                });
                this.monitoring.processing('core_upload', 'multipart.local.completed', {
                    coreFileId: row.id,
                    objectKey: row.objectKey,
                });
                return this.toResponse(row);
            }
            catch (e) {
                this.monitoring.error('core_upload', 'multipart.local.failed', {
                    objectKey,
                    message: e instanceof Error ? e.message : String(e),
                });
                try {
                    await (0, promises_1.unlink)(diskPath);
                }
                catch (_c) {
                }
                throw e;
            }
        }
        const b = this.requireAwsBucket();
        await this.getS3().send(new client_s3_1.PutObjectCommand({
            Bucket: b,
            Key: objectKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        const publicUrl = this.s3PublicUrl(objectKey);
        try {
            const row = await this.prisma.coreFile.create({
                data: Object.assign({ storage: client_1.CoreUploadStorage.S3, status: client_1.CoreUploadStatus.COMPLETED, bucket: b, objectKey, originalName: file.originalname, mimeType: file.mimetype, sizeBytes: file.size, publicUrl, purpose: purposeNorm, completedAt: new Date() }, owner),
            });
            await this.prisma.auditLog.create({
                data: {
                    action: 'core_file.uploaded',
                    entityType: 'CoreFile',
                    entityId: String(row.id),
                    metadataJson: {
                        mode: 's3',
                        objectKey: row.objectKey,
                        mimeType: row.mimeType,
                        sizeBytes: row.sizeBytes,
                        purpose: purposeNorm,
                        companyId: owner.companyId,
                    },
                },
            });
            this.monitoring.processing('core_upload', 'multipart.s3.completed', {
                coreFileId: row.id,
                objectKey: row.objectKey,
            });
            return this.toResponse(row);
        }
        catch (e) {
            this.monitoring.error('core_upload', 'multipart.s3.failed', {
                objectKey,
                message: e instanceof Error ? e.message : String(e),
            });
            try {
                await this.getS3().send(new client_s3_1.DeleteObjectCommand({ Bucket: b, Key: objectKey }));
            }
            catch (delErr) {
                this.logger.warn(`multipart S3 rollback failed for ${objectKey}: ${delErr instanceof Error ? delErr.message : String(delErr)}`);
            }
            throw e;
        }
    }
    async createPresignedUpload(dto, ownership) {
        var _a, _b, _c, _d;
        this.logger.log(JSON.stringify({
            type: 'core_upload.presign.start',
            filename: dto.filename,
            mimeType: dto.mimeType,
            sizeBytes: dto.sizeBytes,
        }));
        const cfg = (0, core_upload_config_1.getCoreUploadConfig)();
        if (cfg.mode !== 'direct') {
            throw new common_1.BadRequestException('Presigned uploads only when VERA_CORE_UPLOAD_MODE=direct');
        }
        this.assertMimeAllowed(dto.mimeType);
        this.assertSizeAllowed(dto.sizeBytes);
        const bucket = this.requireAwsBucket();
        const objectKey = this.makeObjectKey(dto.filename);
        const purposeNorm = (0, core_file_purposes_1.normalizeCoreFilePurpose)(dto.purpose);
        const owner = this.ownershipData({
            userId: ownership === null || ownership === void 0 ? void 0 : ownership.userId,
            companyId: (_b = (_a = ownership === null || ownership === void 0 ? void 0 : ownership.companyId) !== null && _a !== void 0 ? _a : dto.companyId) !== null && _b !== void 0 ? _b : null,
            projectId: (_d = (_c = ownership === null || ownership === void 0 ? void 0 : ownership.projectId) !== null && _c !== void 0 ? _c : dto.projectId) !== null && _d !== void 0 ? _d : null,
        });
        const row = await this.prisma.coreFile.create({
            data: Object.assign({ storage: client_1.CoreUploadStorage.DIRECT_S3, status: client_1.CoreUploadStatus.PENDING, bucket,
                objectKey, originalName: (0, path_1.basename)(dto.filename), mimeType: dto.mimeType, sizeBytes: dto.sizeBytes, publicUrl: null, purpose: purposeNorm }, owner),
        });
        this.monitoring.processing('core_upload', 'presign.record_created', {
            coreFileId: row.id,
            objectKey: row.objectKey,
            sizeBytes: dto.sizeBytes,
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'core_file.presign_created',
                entityType: 'CoreFile',
                entityId: String(row.id),
                metadataJson: {
                    objectKey: row.objectKey,
                    mimeType: row.mimeType,
                    sizeBytes: row.sizeBytes,
                },
            },
        });
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: objectKey,
            ContentType: dto.mimeType,
            ContentLength: dto.sizeBytes,
        });
        let uploadUrl;
        try {
            uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.getS3(), command, { expiresIn: 600 });
        }
        catch (e) {
            await this.prisma.coreFile.update({
                where: { id: row.id },
                data: {
                    status: client_1.CoreUploadStatus.FAILED,
                    failedReason: e instanceof Error ? e.message : String(e),
                },
            });
            throw new common_1.ServiceUnavailableException('Could not create presigned URL');
        }
        return {
            id: row.id,
            uploadUrl,
            method: 'PUT',
            headers: {
                'Content-Type': dto.mimeType,
            },
            objectKey: row.objectKey,
            expiresInSeconds: 600,
        };
    }
    async completeDirectUpload(id) {
        var _a, _b;
        this.logger.log(JSON.stringify({
            type: 'core_upload.complete.start',
            coreFileId: id,
        }));
        const cfg = (0, core_upload_config_1.getCoreUploadConfig)();
        if (cfg.mode !== 'direct') {
            throw new common_1.BadRequestException('complete is only used in direct mode');
        }
        const row = await this.prisma.coreFile.findUnique({ where: { id } });
        if (!row)
            throw new common_1.NotFoundException('Core file not found');
        if (row.status !== client_1.CoreUploadStatus.PENDING) {
            throw new common_1.BadRequestException('Upload is not pending completion');
        }
        if (row.storage !== client_1.CoreUploadStorage.DIRECT_S3 || !row.bucket) {
            throw new common_1.BadRequestException('Invalid direct upload record');
        }
        try {
            const head = await this.getS3().send(new client_s3_1.HeadObjectCommand({
                Bucket: row.bucket,
                Key: row.objectKey,
            }));
            const size = head.ContentLength;
            if (size == null) {
                throw new common_1.BadRequestException('Could not read uploaded object size');
            }
            if (size > (0, core_upload_config_1.getCoreUploadConfig)().maxBytes) {
                throw new common_1.BadRequestException('Uploaded object exceeds configured max size');
            }
            if (size !== row.sizeBytes) {
                throw new common_1.BadRequestException(`Uploaded size ${size} bytes does not match declared ${row.sizeBytes} bytes`);
            }
            const headCt = (_b = (_a = head.ContentType) === null || _a === void 0 ? void 0 : _a.split(';')[0]) === null || _b === void 0 ? void 0 : _b.trim();
            if (headCt && headCt !== row.mimeType) {
                throw new common_1.BadRequestException(`Content-Type mismatch (expected ${row.mimeType}, got ${headCt})`);
            }
            const publicUrl = this.s3PublicUrl(row.objectKey);
            const updated = await this.prisma.coreFile.update({
                where: { id },
                data: {
                    status: client_1.CoreUploadStatus.COMPLETED,
                    publicUrl,
                    sizeBytes: size,
                    completedAt: new Date(),
                    failedReason: null,
                },
            });
            await this.prisma.auditLog.create({
                data: {
                    action: 'core_file.completed',
                    entityType: 'CoreFile',
                    entityId: String(updated.id),
                    metadataJson: {
                        objectKey: updated.objectKey,
                        sizeBytes: updated.sizeBytes,
                    },
                },
            });
            this.monitoring.processing('core_upload', 'direct.complete.success', {
                coreFileId: updated.id,
                sizeBytes: updated.sizeBytes,
            });
            return this.toResponse(updated);
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            this.monitoring.error('core_upload', 'direct.complete.failed', {
                coreFileId: id,
                message: msg,
            });
            try {
                await this.getS3().send(new client_s3_1.DeleteObjectCommand({ Bucket: row.bucket, Key: row.objectKey }));
            }
            catch (delErr) {
                this.logger.warn(`complete_failed: could not delete invalid S3 object ${row.objectKey}: ${delErr instanceof Error ? delErr.message : String(delErr)}`);
            }
            await this.prisma.coreFile.update({
                where: { id },
                data: {
                    status: client_1.CoreUploadStatus.FAILED,
                    failedReason: msg,
                },
            });
            await this.prisma.auditLog.create({
                data: {
                    action: 'core_file.complete_failed',
                    entityType: 'CoreFile',
                    entityId: String(id),
                    metadataJson: { message: msg },
                },
            });
            throw new common_1.BadRequestException(`Could not verify upload in S3: ${msg}`);
        }
    }
    sha256Hex(buffer) {
        return (0, crypto_1.createHash)('sha256').update(new Uint8Array(buffer)).digest('hex');
    }
};
exports.CoreUploadService = CoreUploadService;
exports.CoreUploadService = CoreUploadService = CoreUploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        phase1_monitoring_service_1.Phase1MonitoringService])
], CoreUploadService);
//# sourceMappingURL=core-upload.service.js.map
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VsiAttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const core_upload_service_1 = require("../../modules/core-upload/core-upload.service");
let VsiAttachmentsService = class VsiAttachmentsService {
    constructor(coreUpload) {
        this.coreUpload = coreUpload;
    }
    async resolvePhotoEvidence(coreFileId) {
        const file = await this.coreUpload.findOne(coreFileId);
        if (!file.publicUrl && !file.objectKey) {
            throw new common_1.NotFoundException('Upload not complete or missing URL');
        }
        return {
            coreFileId: file.id,
            storageKey: file.objectKey,
            publicUrl: file.publicUrl,
            fileName: file.originalName,
            mimeType: file.mimeType,
        };
    }
    async resolvePhotoForClassification(coreFileId) {
        const meta = await this.resolvePhotoEvidence(coreFileId);
        const { buffer, mimeType, originalName } = await this.coreUpload.readBuffer(coreFileId);
        return {
            coreFileId,
            storageKey: meta.storageKey,
            publicUrl: meta.publicUrl,
            fileName: originalName !== null && originalName !== void 0 ? originalName : meta.fileName,
            mimeType,
            buffer,
            imageBase64: buffer.toString('base64'),
        };
    }
};
exports.VsiAttachmentsService = VsiAttachmentsService;
exports.VsiAttachmentsService = VsiAttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_upload_service_1.CoreUploadService])
], VsiAttachmentsService);
//# sourceMappingURL=vsi-attachments.service.js.map
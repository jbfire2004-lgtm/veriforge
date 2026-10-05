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
exports.OfflineSyncDto = exports.AddAttachmentDto = exports.AutoPopulateQueryDto = exports.TransitionSafetyFormDto = exports.SubmitSafetyFormDto = exports.SaveSafetyFormDraftDto = exports.CreateSafetyFormDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreateSafetyFormDto {
}
exports.CreateSafetyFormDto = CreateSafetyFormDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSafetyFormDto.prototype, "definitionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSafetyFormDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSafetyFormDto.prototype, "formData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSafetyFormDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSafetyFormDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSafetyFormDto.prototype, "siteId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSafetyFormDto.prototype, "workerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSafetyFormDto.prototype, "equipmentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSafetyFormDto.prototype, "clientSyncId", void 0);
class SaveSafetyFormDraftDto {
}
exports.SaveSafetyFormDraftDto = SaveSafetyFormDraftDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SaveSafetyFormDraftDto.prototype, "formData", void 0);
class SignatureInputDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignatureInputDto.prototype, "fieldId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignatureInputDto.prototype, "signatureData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignatureInputDto.prototype, "signerName", void 0);
class SubmitSafetyFormDto {
}
exports.SubmitSafetyFormDto = SubmitSafetyFormDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SubmitSafetyFormDto.prototype, "formData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SignatureInputDto),
    __metadata("design:type", Array)
], SubmitSafetyFormDto.prototype, "signatures", void 0);
class TransitionSafetyFormDto {
}
exports.TransitionSafetyFormDto = TransitionSafetyFormDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.SafetyFormStatus),
    __metadata("design:type", String)
], TransitionSafetyFormDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransitionSafetyFormDto.prototype, "note", void 0);
class AutoPopulateQueryDto {
}
exports.AutoPopulateQueryDto = AutoPopulateQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AutoPopulateQueryDto.prototype, "workerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AutoPopulateQueryDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AutoPopulateQueryDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AutoPopulateQueryDto.prototype, "equipmentId", void 0);
class AddAttachmentDto {
}
exports.AddAttachmentDto = AddAttachmentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddAttachmentDto.prototype, "fieldId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddAttachmentDto.prototype, "fileName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddAttachmentDto.prototype, "mimeType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddAttachmentDto.prototype, "dataUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], AddAttachmentDto.prototype, "sizeBytes", void 0);
class OfflineSyncDto {
}
exports.OfflineSyncDto = OfflineSyncDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfflineSyncDto.prototype, "clientSyncId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfflineSyncDto.prototype, "definitionId", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], OfflineSyncDto.prototype, "formData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], OfflineSyncDto.prototype, "submit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], OfflineSyncDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], OfflineSyncDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], OfflineSyncDto.prototype, "siteId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], OfflineSyncDto.prototype, "workerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SignatureInputDto),
    __metadata("design:type", Array)
], OfflineSyncDto.prototype, "signatures", void 0);
//# sourceMappingURL=safety-forms.dto.js.map
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
exports.SubmitSafetyWorkflowFormDto = exports.SaveSafetyWorkflowDraftDto = exports.CreateSafetyWorkflowFormDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class SafetyWorkflowSignatureDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SafetyWorkflowSignatureDto.prototype, "fieldId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(8192),
    __metadata("design:type", String)
], SafetyWorkflowSignatureDto.prototype, "signatureData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], SafetyWorkflowSignatureDto.prototype, "signerName", void 0);
class CreateSafetyWorkflowFormDto {
}
exports.CreateSafetyWorkflowFormDto = CreateSafetyWorkflowFormDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.SafetyFormType),
    __metadata("design:type", String)
], CreateSafetyWorkflowFormDto.prototype, "formType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSafetyWorkflowFormDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSafetyWorkflowFormDto.prototype, "workerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSafetyWorkflowFormDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSafetyWorkflowFormDto.prototype, "siteId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSafetyWorkflowFormDto.prototype, "equipmentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateSafetyWorkflowFormDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSafetyWorkflowFormDto.prototype, "formData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateSafetyWorkflowFormDto.prototype, "supervisorId", void 0);
class SaveSafetyWorkflowDraftDto {
}
exports.SaveSafetyWorkflowDraftDto = SaveSafetyWorkflowDraftDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SaveSafetyWorkflowDraftDto.prototype, "formData", void 0);
class SubmitSafetyWorkflowFormDto {
}
exports.SubmitSafetyWorkflowFormDto = SubmitSafetyWorkflowFormDto;
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SubmitSafetyWorkflowFormDto.prototype, "formData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SafetyWorkflowSignatureDto),
    __metadata("design:type", Array)
], SubmitSafetyWorkflowFormDto.prototype, "signatures", void 0);
//# sourceMappingURL=safety-workflow.dto.js.map
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
exports.RejectionWorkflowDto = exports.ApprovalWorkflowDto = exports.ValidateCertificateDto = exports.ValidateInstructorDto = exports.ValidateProviderDto = exports.ValidateTrainingDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class ValidateTrainingDto {
}
exports.ValidateTrainingDto = ValidateTrainingDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ValidateTrainingDto.prototype, "trainingRecordId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateTrainingDto.prototype, "jurisdictionCode", void 0);
class ValidateProviderDto {
}
exports.ValidateProviderDto = ValidateProviderDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ValidateProviderDto.prototype, "trainingProviderId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateProviderDto.prototype, "jurisdictionCode", void 0);
class ValidateInstructorDto {
}
exports.ValidateInstructorDto = ValidateInstructorDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ValidateInstructorDto.prototype, "instructorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateInstructorDto.prototype, "courseCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateInstructorDto.prototype, "jurisdictionCode", void 0);
class ValidateCertificateDto {
}
exports.ValidateCertificateDto = ValidateCertificateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ValidateCertificateDto.prototype, "certificateQrToken", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ValidateCertificateDto.prototype, "trainingRecordId", void 0);
class ApprovalWorkflowDto {
}
exports.ApprovalWorkflowDto = ApprovalWorkflowDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ApprovalWorkflowDto.prototype, "validationResultId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.TrainingValidationOutcome),
    __metadata("design:type", String)
], ApprovalWorkflowDto.prototype, "outcome", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApprovalWorkflowDto.prototype, "notes", void 0);
class RejectionWorkflowDto {
}
exports.RejectionWorkflowDto = RejectionWorkflowDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], RejectionWorkflowDto.prototype, "validationResultId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RejectionWorkflowDto.prototype, "rejectionCodes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectionWorkflowDto.prototype, "notes", void 0);
//# sourceMappingURL=training-standards.dto.js.map
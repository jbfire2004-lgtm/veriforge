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
exports.RequestApprovalDto = exports.SignCertificateDto = exports.UploadClassListDto = exports.InstructorOnboardingDto = exports.ProviderOnboardingDto = exports.CertificateUploadDto = exports.ProviderApprovalDto = exports.IssueCertificateDto = exports.UploadTrainingDto = exports.CreateTrainingInstructorDto = exports.CreateTrainingCourseDto = exports.CourseStandardDto = exports.UpdateTrainingProviderProfileDto = exports.CreateTrainingProviderDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class CreateTrainingProviderDto {
}
exports.CreateTrainingProviderDto = CreateTrainingProviderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingProviderDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingProviderDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateTrainingProviderDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingProviderDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateTrainingProviderDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingProviderDto.prototype, "address", void 0);
class UpdateTrainingProviderProfileDto {
}
exports.UpdateTrainingProviderProfileDto = UpdateTrainingProviderProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrainingProviderProfileDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrainingProviderProfileDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateTrainingProviderProfileDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTrainingProviderProfileDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateTrainingProviderProfileDto.prototype, "logoUrl", void 0);
class CourseStandardDto {
}
exports.CourseStandardDto = CourseStandardDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CourseStandardDto.prototype, "standardKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CourseStandardDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CourseStandardDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CourseStandardDto.prototype, "required", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CourseStandardDto.prototype, "minScore", void 0);
class CreateTrainingCourseDto {
}
exports.CreateTrainingCourseDto = CreateTrainingCourseDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingCourseDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingCourseDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingCourseDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTrainingCourseDto.prototype, "certificationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateTrainingCourseDto.prototype, "durationHours", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateTrainingCourseDto.prototype, "validityDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingCourseDto.prototype, "contentText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CourseStandardDto),
    __metadata("design:type", Array)
], CreateTrainingCourseDto.prototype, "standards", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], CreateTrainingCourseDto.prototype, "instructorIds", void 0);
class CreateTrainingInstructorDto {
}
exports.CreateTrainingInstructorDto = CreateTrainingInstructorDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingInstructorDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingInstructorDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateTrainingInstructorDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTrainingInstructorDto.prototype, "licenseNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateTrainingInstructorDto.prototype, "qualifiedCourseCodes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTrainingInstructorDto.prototype, "qualificationExpiresAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], CreateTrainingInstructorDto.prototype, "courseIds", void 0);
class UploadTrainingDto {
}
exports.UploadTrainingDto = UploadTrainingDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UploadTrainingDto.prototype, "workerId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UploadTrainingDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UploadTrainingDto.prototype, "instructorId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UploadTrainingDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UploadTrainingDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UploadTrainingDto.prototype, "equipmentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UploadTrainingDto.prototype, "issuedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UploadTrainingDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UploadTrainingDto.prototype, "certificateNumber", void 0);
class IssueCertificateDto {
}
exports.IssueCertificateDto = IssueCertificateDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], IssueCertificateDto.prototype, "trainingRecordId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], IssueCertificateDto.prototype, "certificateUrl", void 0);
class ProviderApprovalDto {
}
exports.ProviderApprovalDto = ProviderApprovalDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ProviderApprovalStatus),
    __metadata("design:type", String)
], ProviderApprovalDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProviderApprovalDto.prototype, "notes", void 0);
class CertificateUploadDto {
}
exports.CertificateUploadDto = CertificateUploadDto;
__decorate([
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CertificateUploadDto.prototype, "certificateUrl", void 0);
class ProviderOnboardingDto extends CreateTrainingProviderDto {
}
exports.ProviderOnboardingDto = ProviderOnboardingDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ProviderOnboardingDto.prototype, "adminEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProviderOnboardingDto.prototype, "adminPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProviderOnboardingDto.prototype, "adminUsername", void 0);
class InstructorOnboardingDto extends CreateTrainingInstructorDto {
}
exports.InstructorOnboardingDto = InstructorOnboardingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], InstructorOnboardingDto.prototype, "userEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InstructorOnboardingDto.prototype, "userPassword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InstructorOnboardingDto.prototype, "userUsername", void 0);
class UploadClassListDto {
}
exports.UploadClassListDto = UploadClassListDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UploadClassListDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsInt)({ each: true }),
    __metadata("design:type", Array)
], UploadClassListDto.prototype, "workerIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UploadClassListDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UploadClassListDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UploadClassListDto.prototype, "issuedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UploadClassListDto.prototype, "expiresAt", void 0);
class SignCertificateDto {
}
exports.SignCertificateDto = SignCertificateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignCertificateDto.prototype, "signatureName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SignCertificateDto.prototype, "signedAt", void 0);
class RequestApprovalDto {
}
exports.RequestApprovalDto = RequestApprovalDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequestApprovalDto.prototype, "notes", void 0);
//# sourceMappingURL=training-provider.dto.js.map
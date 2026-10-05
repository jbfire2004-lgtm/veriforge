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
exports.UpdatePmInspectionTemplateDto = exports.CreatePmInspectionTemplateDto = exports.ChecklistItemDto = exports.RequiredSignatureDto = exports.TemplateScoringRulesDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class TemplateScoringRulesDto {
}
exports.TemplateScoringRulesDto = TemplateScoringRulesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], TemplateScoringRulesDto.prototype, "failThresholdPercent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], TemplateScoringRulesDto.prototype, "reviewThresholdRisk", void 0);
class RequiredSignatureDto {
}
exports.RequiredSignatureDto = RequiredSignatureDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], RequiredSignatureDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RequiredSignatureDto.prototype, "label", void 0);
class ChecklistItemDto {
}
exports.ChecklistItemDto = ChecklistItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], ChecklistItemDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], ChecklistItemDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChecklistItemDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ChecklistItemDto.prototype, "required", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ChecklistItemDto.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ChecklistItemDto.prototype, "critical", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ChecklistItemDto.prototype, "showIf", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], ChecklistItemDto.prototype, "options", void 0);
class CreatePmInspectionTemplateDto {
}
exports.CreatePmInspectionTemplateDto = CreatePmInspectionTemplateDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePmInspectionTemplateDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePmInspectionTemplateDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreatePmInspectionTemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePmInspectionTemplateDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePmInspectionTemplateDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePmInspectionTemplateDto.prototype, "scoringMode", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChecklistItemDto),
    __metadata("design:type", Array)
], CreatePmInspectionTemplateDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TemplateScoringRulesDto),
    __metadata("design:type", TemplateScoringRulesDto)
], CreatePmInspectionTemplateDto.prototype, "scoringRules", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RequiredSignatureDto),
    __metadata("design:type", Array)
], CreatePmInspectionTemplateDto.prototype, "requiredSignatures", void 0);
class UpdatePmInspectionTemplateDto {
}
exports.UpdatePmInspectionTemplateDto = UpdatePmInspectionTemplateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], UpdatePmInspectionTemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePmInspectionTemplateDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePmInspectionTemplateDto.prototype, "scoringMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChecklistItemDto),
    __metadata("design:type", Array)
], UpdatePmInspectionTemplateDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => TemplateScoringRulesDto),
    __metadata("design:type", TemplateScoringRulesDto)
], UpdatePmInspectionTemplateDto.prototype, "scoringRules", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RequiredSignatureDto),
    __metadata("design:type", Array)
], UpdatePmInspectionTemplateDto.prototype, "requiredSignatures", void 0);
//# sourceMappingURL=pm-inspection-template.dto.js.map
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
exports.UpsertCompetencyRequirementDto = exports.CheckCompetencyDto = exports.EvaluateCompetencyDto = void 0;
const class_validator_1 = require("class-validator");
class EvaluateCompetencyDto {
}
exports.EvaluateCompetencyDto = EvaluateCompetencyDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], EvaluateCompetencyDto.prototype, "workerId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], EvaluateCompetencyDto.prototype, "equipmentId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], EvaluateCompetencyDto.prototype, "score", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EvaluateCompetencyDto.prototype, "passed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], EvaluateCompetencyDto.prototype, "evaluationDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EvaluateCompetencyDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EvaluateCompetencyDto.prototype, "evidenceNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], EvaluateCompetencyDto.prototype, "evidencePhotos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EvaluateCompetencyDto.prototype, "workerSignature", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EvaluateCompetencyDto.prototype, "evaluatorSignature", void 0);
class CheckCompetencyDto {
}
exports.CheckCompetencyDto = CheckCompetencyDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CheckCompetencyDto.prototype, "workerId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CheckCompetencyDto.prototype, "equipmentId", void 0);
class UpsertCompetencyRequirementDto {
}
exports.UpsertCompetencyRequirementDto = UpsertCompetencyRequirementDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpsertCompetencyRequirementDto.prototype, "minPassingScore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpsertCompetencyRequirementDto.prototype, "expiryDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpsertCompetencyRequirementDto.prototype, "requireEvaluation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpsertCompetencyRequirementDto.prototype, "certificationId", void 0);
//# sourceMappingURL=evaluate-competency.dto.js.map
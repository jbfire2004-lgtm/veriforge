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
exports.AiGenerateOrientationDto = void 0;
const class_validator_1 = require("class-validator");
class AiGenerateOrientationDto {
}
exports.AiGenerateOrientationDto = AiGenerateOrientationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiGenerateOrientationDto.prototype, "industry", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiGenerateOrientationDto.prototype, "businessType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiGenerateOrientationDto.prototype, "workEnvironment", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], AiGenerateOrientationDto.prototype, "hazards", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], AiGenerateOrientationDto.prototype, "ppeRequirements", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], AiGenerateOrientationDto.prototype, "safetyPrograms", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiGenerateOrientationDto.prototype, "regulatoryRegion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiGenerateOrientationDto.prototype, "companyRules", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiGenerateOrientationDto.prototype, "siteRules", void 0);
//# sourceMappingURL=ai-generate-orientation.dto.js.map
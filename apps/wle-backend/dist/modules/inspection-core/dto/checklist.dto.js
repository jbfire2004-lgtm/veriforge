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
exports.UpdateChecklistDto = exports.CreateChecklistDto = exports.ChecklistItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class ChecklistItemDto {
}
exports.ChecklistItemDto = ChecklistItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChecklistItemDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChecklistItemDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ChecklistItemDto.prototype, "required", void 0);
class CreateChecklistDto {
}
exports.CreateChecklistDto = CreateChecklistDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChecklistDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.InspectionChecklistCategory),
    __metadata("design:type", String)
], CreateChecklistDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.InspectionType),
    __metadata("design:type", String)
], CreateChecklistDto.prototype, "inspectionType", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChecklistItemDto),
    __metadata("design:type", Array)
], CreateChecklistDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateChecklistDto.prototype, "intervalDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateChecklistDto.prototype, "intervalHours", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChecklistDto.prototype, "active", void 0);
class UpdateChecklistDto {
}
exports.UpdateChecklistDto = UpdateChecklistDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateChecklistDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.InspectionChecklistCategory),
    __metadata("design:type", String)
], UpdateChecklistDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.InspectionType),
    __metadata("design:type", String)
], UpdateChecklistDto.prototype, "inspectionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ChecklistItemDto),
    __metadata("design:type", Array)
], UpdateChecklistDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateChecklistDto.prototype, "intervalDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UpdateChecklistDto.prototype, "intervalHours", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateChecklistDto.prototype, "active", void 0);
//# sourceMappingURL=checklist.dto.js.map
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
exports.CreatePpePreUseDto = exports.PpePreUseItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const ppe_preuse_constants_1 = require("./ppe-preuse.constants");
const ITEM_IDS = ppe_preuse_constants_1.PPE_PREUSE_CHECKLIST.map((i) => i.id);
class PpePreUseItemDto {
}
exports.PpePreUseItemDto = PpePreUseItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(ITEM_IDS),
    __metadata("design:type", String)
], PpePreUseItemDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['pass', 'fail', 'na']),
    __metadata("design:type", String)
], PpePreUseItemDto.prototype, "result", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], PpePreUseItemDto.prototype, "note", void 0);
class CreatePpePreUseDto {
}
exports.CreatePpePreUseDto = CreatePpePreUseDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePpePreUseDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePpePreUseDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePpePreUseDto.prototype, "workerId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreatePpePreUseDto.prototype, "locationNote", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreatePpePreUseDto.prototype, "taskType", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PpePreUseItemDto),
    __metadata("design:type", Array)
], CreatePpePreUseDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePpePreUseDto.prototype, "deficiencies", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePpePreUseDto.prototype, "removedFromService", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePpePreUseDto.prototype, "acknowledgedSafeToWork", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePpePreUseDto.prototype, "inspectedAt", void 0);
//# sourceMappingURL=create-ppe-preuse.dto.js.map
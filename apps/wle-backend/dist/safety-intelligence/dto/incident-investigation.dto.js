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
exports.BulkIncidentCapaDto = exports.UpdateIncidentInvestigationDto = exports.OpenIncidentInvestigationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class OpenIncidentInvestigationDto {
}
exports.OpenIncidentInvestigationDto = OpenIncidentInvestigationDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], OpenIncidentInvestigationDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OpenIncidentInvestigationDto.prototype, "narrative", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OpenIncidentInvestigationDto.prototype, "immediateActions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], OpenIncidentInvestigationDto.prototype, "leadInvestigatorId", void 0);
class UpdateIncidentInvestigationDto {
}
exports.UpdateIncidentInvestigationDto = UpdateIncidentInvestigationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIncidentInvestigationDto.prototype, "narrative", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIncidentInvestigationDto.prototype, "immediateActions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIncidentInvestigationDto.prototype, "investigationStatus", void 0);
class CapaItemDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CapaItemDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CapaItemDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CapaItemDto.prototype, "ownerCompanyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CapaItemDto.prototype, "assignedUserId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CapaItemDto.prototype, "actionType", void 0);
class BulkIncidentCapaDto {
}
exports.BulkIncidentCapaDto = BulkIncidentCapaDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CapaItemDto),
    __metadata("design:type", Array)
], BulkIncidentCapaDto.prototype, "items", void 0);
//# sourceMappingURL=incident-investigation.dto.js.map
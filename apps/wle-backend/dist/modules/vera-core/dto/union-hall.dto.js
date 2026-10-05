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
exports.DispatchWorkerDto = exports.AddUnionMemberDto = exports.CreateUnionHallDto = void 0;
const class_validator_1 = require("class-validator");
class CreateUnionHallDto {
}
exports.CreateUnionHallDto = CreateUnionHallDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUnionHallDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUnionHallDto.prototype, "localNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUnionHallDto.prototype, "region", void 0);
class AddUnionMemberDto {
}
exports.AddUnionMemberDto = AddUnionMemberDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddUnionMemberDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddUnionMemberDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddUnionMemberDto.prototype, "memberNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddUnionMemberDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddUnionMemberDto.prototype, "phone", void 0);
class DispatchWorkerDto {
}
exports.DispatchWorkerDto = DispatchWorkerDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DispatchWorkerDto.prototype, "workerId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], DispatchWorkerDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DispatchWorkerDto.prototype, "notes", void 0);
//# sourceMappingURL=union-hall.dto.js.map
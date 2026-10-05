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
exports.CreateWorkerDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
function trimString(value) {
    return typeof value === 'string' ? value.trim() : String(value !== null && value !== void 0 ? value : '').trim();
}
class CreateWorkerDto {
}
exports.CreateWorkerDto = CreateWorkerDto;
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => trimString(value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'firstName is required' }),
    __metadata("design:type", String)
], CreateWorkerDto.prototype, "firstName", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => trimString(value)),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1, { message: 'lastName is required' }),
    __metadata("design:type", String)
], CreateWorkerDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateWorkerDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkerDto.prototype, "photoUrl", void 0);
//# sourceMappingURL=create-worker.dto.js.map
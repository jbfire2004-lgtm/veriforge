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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrController = void 0;
const common_1 = require("@nestjs/common");
const public_rate_limit_decorator_1 = require("../security/decorators/public-rate-limit.decorator");
const positive_int_pipe_1 = require("../security/validation/positive-int.pipe");
const qr_scan_dto_1 = require("./dto/qr-scan.dto");
const qr_service_1 = require("./qr.service");
let QrController = class QrController {
    constructor(qrService) {
        this.qrService = qrService;
    }
    scan(body) {
        return this.qrService.parseAndVerify(body);
    }
    workerQr(id) {
        return this.qrService.generateWorkerQr(id);
    }
    equipmentQr(id) {
        return this.qrService.generateEquipmentQr(id);
    }
    combinedQr(workerId, equipmentId) {
        return this.qrService.generateCombinedQr(workerId, equipmentId);
    }
};
exports.QrController = QrController;
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(40),
    (0, common_1.Post)('scan'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [qr_scan_dto_1.QrScanDto]),
    __metadata("design:returntype", void 0)
], QrController.prototype, "scan", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(30),
    (0, common_1.Get)('worker/:id'),
    __param(0, (0, common_1.Param)('id', positive_int_pipe_1.PositiveIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QrController.prototype, "workerQr", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(30),
    (0, common_1.Get)('equipment/:id'),
    __param(0, (0, common_1.Param)('id', positive_int_pipe_1.PositiveIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], QrController.prototype, "equipmentQr", null);
__decorate([
    (0, public_rate_limit_decorator_1.PublicRateLimited)(30),
    (0, common_1.Get)('combined'),
    __param(0, (0, common_1.Query)('worker', positive_int_pipe_1.PositiveIntPipe)),
    __param(1, (0, common_1.Query)('equipment', positive_int_pipe_1.PositiveIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], QrController.prototype, "combinedQr", null);
exports.QrController = QrController = __decorate([
    (0, common_1.Controller)('qr'),
    __metadata("design:paramtypes", [qr_service_1.QrService])
], QrController);
//# sourceMappingURL=qr.controller.js.map
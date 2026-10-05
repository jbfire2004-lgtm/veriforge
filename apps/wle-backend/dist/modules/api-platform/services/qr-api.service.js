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
exports.QrApiService = void 0;
const common_1 = require("@nestjs/common");
const qr_service_1 = require("../../../qr/qr.service");
let QrApiService = class QrApiService {
    constructor(qr) {
        this.qr = qr;
    }
    scan(body) {
        return this.qr.parseAndVerify({
            qr: body.qr,
            assumedTarget: body.assumedTarget,
        });
    }
};
exports.QrApiService = QrApiService;
exports.QrApiService = QrApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [qr_service_1.QrService])
], QrApiService);
//# sourceMappingURL=qr-api.service.js.map
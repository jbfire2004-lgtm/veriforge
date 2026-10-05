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
exports.VisionController = void 0;
const common_1 = require("@nestjs/common");
const routes_1 = require("../../config/routes");
const vision_service_1 = require("./vision.service");
let VisionController = class VisionController {
    constructor(vision) {
        this.vision = vision;
    }
    analyze(body) {
        return this.vision.analyze(body);
    }
    certificate(body) {
        return this.vision.analyzeCertificate(body);
    }
    inspection(body) {
        return this.vision.analyzeInspection(body);
    }
    equipmentPlate(body) {
        return this.vision.analyzeEquipmentPlate(body);
    }
    workerDocument(body) {
        const subtype = body.subtype;
        return this.vision.analyze(Object.assign(Object.assign({}, body), { documentType: subtype !== null && subtype !== void 0 ? subtype : 'worker_id' }));
    }
    providerDocument(body) {
        const subtype = body.subtype;
        return this.vision.analyze(Object.assign(Object.assign({}, body), { documentType: subtype !== null && subtype !== void 0 ? subtype : 'provider_approval' }));
    }
    projectForm(body) {
        return this.vision.analyze(Object.assign(Object.assign({}, body), { documentType: 'project_safety_form' }));
    }
    dashboard(companyId) {
        return this.vision.getDashboard(companyId ? Number(companyId) : undefined);
    }
    capabilities(hasOcrText) {
        return this.vision.getCapabilities(hasOcrText === 'true' || hasOcrText === '1');
    }
};
exports.VisionController = VisionController;
__decorate([
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VisionController.prototype, "analyze", null);
__decorate([
    (0, common_1.Post)('certificate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VisionController.prototype, "certificate", null);
__decorate([
    (0, common_1.Post)('inspection'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VisionController.prototype, "inspection", null);
__decorate([
    (0, common_1.Post)('equipment-plate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VisionController.prototype, "equipmentPlate", null);
__decorate([
    (0, common_1.Post)('worker-document'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VisionController.prototype, "workerDocument", null);
__decorate([
    (0, common_1.Post)('provider-document'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VisionController.prototype, "providerDocument", null);
__decorate([
    (0, common_1.Post)('project-form'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VisionController.prototype, "projectForm", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VisionController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('capabilities'),
    __param(0, (0, common_1.Query)('hasOcrText')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VisionController.prototype, "capabilities", null);
exports.VisionController = VisionController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/vision`),
    __metadata("design:paramtypes", [vision_service_1.VisionService])
], VisionController);
//# sourceMappingURL=vision.controller.js.map
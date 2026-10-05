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
exports.DigitalTwinController = void 0;
const common_1 = require("@nestjs/common");
const routes_1 = require("../../config/routes");
const digital_twin_service_1 = require("./digital-twin.service");
let DigitalTwinController = class DigitalTwinController {
    constructor(twins) {
        this.twins = twins;
    }
    hydrate(companyId) {
        return this.twins.hydrateCompany(Number(companyId));
    }
    dashboard() {
        return this.twins.getDashboard();
    }
    getTwin(type, id) {
        return this.twins.getTwin(type, id);
    }
    timeline(type, id) {
        return this.twins.getTimeline(type, id);
    }
    history(type, id) {
        return this.twins.getHistory(type, id);
    }
    applyEvent(body) {
        return this.twins.applyEvent(body);
    }
    offlineEvent(body) {
        var _a;
        this.twins.applyOfflineEvent(body, (_a = body.clientVersion) !== null && _a !== void 0 ? _a : 1);
        return { ok: true };
    }
    sync(type, id) {
        return this.twins.syncTwin(type, id);
    }
};
exports.DigitalTwinController = DigitalTwinController;
__decorate([
    (0, common_1.Post)('hydrate'),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DigitalTwinController.prototype, "hydrate", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DigitalTwinController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)(':type/:id'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DigitalTwinController.prototype, "getTwin", null);
__decorate([
    (0, common_1.Get)(':type/:id/timeline'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DigitalTwinController.prototype, "timeline", null);
__decorate([
    (0, common_1.Get)(':type/:id/history'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DigitalTwinController.prototype, "history", null);
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DigitalTwinController.prototype, "applyEvent", null);
__decorate([
    (0, common_1.Post)('offline/events'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DigitalTwinController.prototype, "offlineEvent", null);
__decorate([
    (0, common_1.Post)(':type/:id/sync'),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DigitalTwinController.prototype, "sync", null);
exports.DigitalTwinController = DigitalTwinController = __decorate([
    (0, common_1.Controller)(`${routes_1.API_V1_PREFIX}/twins`),
    __metadata("design:paramtypes", [digital_twin_service_1.DigitalTwinService])
], DigitalTwinController);
//# sourceMappingURL=digital-twin.controller.js.map
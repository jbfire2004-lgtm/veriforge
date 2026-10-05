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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
function parseOptionalInt(value) {
    if (value == null || value === '')
        return undefined;
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : undefined;
}
let AnalyticsController = class AnalyticsController {
    constructor(analytics) {
        this.analytics = analytics;
    }
    overview() {
        return this.analytics.overview();
    }
    incidentsBySeverity() {
        return this.analytics.incidentsBySeverity();
    }
    incidentsTimeline() {
        return this.analytics.incidentsTimeline();
    }
    trainingExpiry() {
        return this.analytics.trainingExpirySummary();
    }
    companyRisk() {
        return this.analytics.companyRiskRanking();
    }
    recent(limitRaw) {
        var _a;
        return this.analytics.recent((_a = parseOptionalInt(limitRaw)) !== null && _a !== void 0 ? _a : 5);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('incidents/severity'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "incidentsBySeverity", null);
__decorate([
    (0, common_1.Get)('incidents/timeline'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "incidentsTimeline", null);
__decorate([
    (0, common_1.Get)('training/expiry'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "trainingExpiry", null);
__decorate([
    (0, common_1.Get)('companies/risk'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "companyRisk", null);
__decorate([
    (0, common_1.Get)('recent'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "recent", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map
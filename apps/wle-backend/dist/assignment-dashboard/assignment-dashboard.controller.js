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
exports.AssignmentDashboardController = void 0;
const common_1 = require("@nestjs/common");
const assignment_dashboard_service_1 = require("./assignment-dashboard.service");
let AssignmentDashboardController = class AssignmentDashboardController {
    constructor(dash) {
        this.dash = dash;
    }
    overview() {
        return this.dash.overview();
    }
    activeAssignments() {
        return this.dash.activeAssignments();
    }
    workerLoad() {
        return this.dash.workerLoad();
    }
    equipmentUtilization() {
        return this.dash.equipmentUtilization();
    }
    siteStaffing() {
        return this.dash.siteStaffing();
    }
    companyAssignments(id) {
        return this.dash.companyAssignments(id);
    }
};
exports.AssignmentDashboardController = AssignmentDashboardController;
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AssignmentDashboardController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AssignmentDashboardController.prototype, "activeAssignments", null);
__decorate([
    (0, common_1.Get)('worker-load'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AssignmentDashboardController.prototype, "workerLoad", null);
__decorate([
    (0, common_1.Get)('equipment-utilization'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AssignmentDashboardController.prototype, "equipmentUtilization", null);
__decorate([
    (0, common_1.Get)('site-staffing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AssignmentDashboardController.prototype, "siteStaffing", null);
__decorate([
    (0, common_1.Get)('company/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AssignmentDashboardController.prototype, "companyAssignments", null);
exports.AssignmentDashboardController = AssignmentDashboardController = __decorate([
    (0, common_1.Controller)('assignment-dashboard'),
    __metadata("design:paramtypes", [assignment_dashboard_service_1.AssignmentDashboardService])
], AssignmentDashboardController);
//# sourceMappingURL=assignment-dashboard.controller.js.map
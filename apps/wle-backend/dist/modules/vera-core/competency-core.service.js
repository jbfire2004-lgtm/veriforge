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
exports.CompetencyCoreService = void 0;
const common_1 = require("@nestjs/common");
const competency_service_1 = require("../competency/competency.service");
let CompetencyCoreService = class CompetencyCoreService {
    constructor(competency) {
        this.competency = competency;
    }
    evaluate(data) {
        return this.competency.evaluate(data);
    }
    listForWorker(workerId) {
        return this.competency.listForWorker(workerId);
    }
    check(workerId, equipmentId) {
        return this.competency.checkWorkerEquipment(workerId, equipmentId);
    }
};
exports.CompetencyCoreService = CompetencyCoreService;
exports.CompetencyCoreService = CompetencyCoreService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [competency_service_1.CompetencyService])
], CompetencyCoreService);
//# sourceMappingURL=competency-core.service.js.map
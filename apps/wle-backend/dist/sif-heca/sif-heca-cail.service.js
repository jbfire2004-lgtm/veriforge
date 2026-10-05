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
exports.SifHecaCailService = void 0;
const common_1 = require("@nestjs/common");
const cail_emitter_service_1 = require("../safety-intelligence/cail/cail-emitter.service");
let SifHecaCailService = class SifHecaCailService {
    constructor(emitter) {
        this.emitter = emitter;
    }
    async emitCorrectiveActions(eventId, projectId, ownerCompanyId, items, createdByUserId, siteId, workerId) {
        var _a;
        const results = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const entry = await this.emitter.emit({
                projectId,
                ownerCompanyId,
                sourceType: 'sif',
                sourceId: eventId,
                sourceItemId: `capa-${i}`,
                title: item.title.slice(0, 120),
                description: item.description,
                severity: (_a = item.severity) !== null && _a !== void 0 ? _a : 'high',
                createdByUserId,
                siteId,
                workerId,
            });
            results.push(entry);
        }
        return results;
    }
};
exports.SifHecaCailService = SifHecaCailService;
exports.SifHecaCailService = SifHecaCailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cail_emitter_service_1.CailEmitterService])
], SifHecaCailService);
//# sourceMappingURL=sif-heca-cail.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VsiDashboardRevisionService = void 0;
const common_1 = require("@nestjs/common");
let VsiDashboardRevisionService = class VsiDashboardRevisionService {
    constructor() {
        this.revisions = new Map();
        this.listeners = new Set();
    }
    getRevision(projectId) {
        var _a;
        return (_a = this.revisions.get(projectId)) !== null && _a !== void 0 ? _a : 0;
    }
    bump(projectId) {
        var _a;
        const next = ((_a = this.revisions.get(projectId)) !== null && _a !== void 0 ? _a : 0) + 1;
        this.revisions.set(projectId, next);
        for (const listener of this.listeners) {
            listener(projectId, next);
        }
        return next;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
};
exports.VsiDashboardRevisionService = VsiDashboardRevisionService;
exports.VsiDashboardRevisionService = VsiDashboardRevisionService = __decorate([
    (0, common_1.Injectable)()
], VsiDashboardRevisionService);
//# sourceMappingURL=vsi-dashboard-revision.service.js.map
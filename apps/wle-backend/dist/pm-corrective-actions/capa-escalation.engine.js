"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapaEscalationEngine = void 0;
const common_1 = require("@nestjs/common");
const pm_capa_constants_1 = require("./pm-capa.constants");
let CapaEscalationEngine = class CapaEscalationEngine {
    evaluate(input) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (input.status === 'closed' ||
            input.status === 'verified' ||
            input.status === 'cancelled') {
            return null;
        }
        const now = Date.now();
        const overdue = input.dueAt ? input.dueAt.getTime() < now : false;
        if (input.equipmentUnsafe && ((_a = input.currentLevel) !== null && _a !== void 0 ? _a : 0) < 3) {
            return {
                level: 3,
                reason: 'Equipment unsafe — safety escalation',
                shouldNotify: true,
            };
        }
        if ((input.sifLinked || input.hecaLinked) &&
            ((_b = input.currentLevel) !== null && _b !== void 0 ? _b : 0) < 3) {
            return {
                level: 3,
                reason: 'SIF/HECA-linked CAPA — safety escalation',
                shouldNotify: true,
            };
        }
        if (input.severity === 'critical' && ((_c = input.currentLevel) !== null && _c !== void 0 ? _c : 0) < 4) {
            return {
                level: 4,
                reason: 'Critical severity — PM escalation',
                shouldNotify: true,
            };
        }
        if (overdue) {
            const daysOver = input.dueAt
                ? Math.floor((now - input.dueAt.getTime()) / (24 * 60 * 60 * 1000))
                : 0;
            if (daysOver >= 7 && ((_d = input.currentLevel) !== null && _d !== void 0 ? _d : 0) < 5) {
                return { level: 5, reason: pm_capa_constants_1.ESCALATION_LEVELS[5], shouldNotify: true };
            }
            if (daysOver >= 3 && ((_e = input.currentLevel) !== null && _e !== void 0 ? _e : 0) < 4) {
                return { level: 4, reason: pm_capa_constants_1.ESCALATION_LEVELS[4], shouldNotify: true };
            }
            if (daysOver >= 1 && ((_f = input.currentLevel) !== null && _f !== void 0 ? _f : 0) < 2) {
                return { level: 2, reason: pm_capa_constants_1.ESCALATION_LEVELS[2], shouldNotify: true };
            }
            if (((_g = input.currentLevel) !== null && _g !== void 0 ? _g : 0) < 1) {
                return { level: 1, reason: pm_capa_constants_1.ESCALATION_LEVELS[1], shouldNotify: true };
            }
        }
        return null;
    }
};
exports.CapaEscalationEngine = CapaEscalationEngine;
exports.CapaEscalationEngine = CapaEscalationEngine = __decorate([
    (0, common_1.Injectable)()
], CapaEscalationEngine);
//# sourceMappingURL=capa-escalation.engine.js.map
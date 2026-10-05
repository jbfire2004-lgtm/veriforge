"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapaDueDateEngine = void 0;
const common_1 = require("@nestjs/common");
const pm_capa_constants_1 = require("./pm-capa.constants");
let CapaDueDateEngine = class CapaDueDateEngine {
    computeDueAt(severity, config, from = new Date()) {
        var _a, _b, _c, _d;
        const days = severity === 'critical'
            ? (_a = config === null || config === void 0 ? void 0 : config.dueDaysCritical) !== null && _a !== void 0 ? _a : pm_capa_constants_1.DUE_DAYS_DEFAULT.critical
            : severity === 'high'
                ? (_b = config === null || config === void 0 ? void 0 : config.dueDaysHigh) !== null && _b !== void 0 ? _b : pm_capa_constants_1.DUE_DAYS_DEFAULT.high
                : severity === 'medium'
                    ? (_c = config === null || config === void 0 ? void 0 : config.dueDaysMedium) !== null && _c !== void 0 ? _c : pm_capa_constants_1.DUE_DAYS_DEFAULT.medium
                    : (_d = config === null || config === void 0 ? void 0 : config.dueDaysLow) !== null && _d !== void 0 ? _d : pm_capa_constants_1.DUE_DAYS_DEFAULT.low;
        return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
    }
};
exports.CapaDueDateEngine = CapaDueDateEngine;
exports.CapaDueDateEngine = CapaDueDateEngine = __decorate([
    (0, common_1.Injectable)()
], CapaDueDateEngine);
//# sourceMappingURL=capa-due-date.engine.js.map
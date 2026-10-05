"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapaPriorityEngine = void 0;
const common_1 = require("@nestjs/common");
const pm_capa_constants_1 = require("./pm-capa.constants");
let CapaPriorityEngine = class CapaPriorityEngine {
    score(input) {
        const explainability = [];
        const severityScore = (0, pm_capa_constants_1.severityToScore)(input.severity);
        explainability.push({ rule: 'base_severity', points: severityScore });
        let priorityScore = severityScore;
        const typeBoost = (0, pm_capa_constants_1.actionTypeDefault)(input.actionType).priorityBoost;
        priorityScore += typeBoost;
        explainability.push({ rule: 'action_type', points: typeBoost });
        if (input.sifLinked) {
            priorityScore += 20;
            explainability.push({ rule: 'sif_linked', points: 20 });
        }
        if (input.hecaLinked) {
            priorityScore += 15;
            explainability.push({ rule: 'heca_linked', points: 15 });
        }
        if (input.equipmentUnsafe) {
            priorityScore += 25;
            explainability.push({ rule: 'equipment_unsafe', points: 25 });
        }
        if (input.overdue) {
            priorityScore += 30;
            explainability.push({ rule: 'overdue', points: 30 });
        }
        priorityScore = Math.min(100, priorityScore);
        return { severityScore, priorityScore, explainability };
    }
};
exports.CapaPriorityEngine = CapaPriorityEngine;
exports.CapaPriorityEngine = CapaPriorityEngine = __decorate([
    (0, common_1.Injectable)()
], CapaPriorityEngine);
//# sourceMappingURL=capa-priority.engine.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossModuleIntegrationEngine = void 0;
class CrossModuleIntegrationEngine {
    jhaApprovalGate(openCapaForJha, sifLinkedOpen) {
        const blockers = [];
        if (openCapaForJha > 0) {
            blockers.push(`${openCapaForJha} unresolved corrective action(s) linked to this JHA`);
        }
        if (sifLinkedOpen > 0) {
            blockers.push(`${sifLinkedOpen} SIF-linked CAPA require closure before approval`);
        }
        return {
            allowed: blockers.length === 0,
            module: 'jha_flha',
            blockers,
        };
    }
    pmTaskStartGate(projectCriticalOpen, workerOverdue) {
        const blockers = [];
        if (projectCriticalOpen > 0) {
            blockers.push(`${projectCriticalOpen} critical project CAPA unresolved`);
        }
        if (workerOverdue > 0) {
            blockers.push(`${workerOverdue} overdue worker CAPA`);
        }
        return {
            allowed: blockers.length === 0,
            module: 'pm_task',
            blockers,
        };
    }
    permitApprovalGate(openCapa) {
        return {
            allowed: openCapa === 0,
            module: 'permit',
            blockers: openCapa > 0 ? [`${openCapa} open CAPA block permit approval`] : [],
        };
    }
    safetyStationEnforcement(workerBlocked, equipmentBlocked) {
        const blockers = [];
        if (workerBlocked)
            blockers.push('Worker has unresolved CAPA');
        if (equipmentBlocked)
            blockers.push('Equipment has unresolved CAPA');
        return {
            allowed: blockers.length === 0,
            module: 'safety_station',
            blockers,
        };
    }
}
exports.CrossModuleIntegrationEngine = CrossModuleIntegrationEngine;
//# sourceMappingURL=cross-module-integration.engine.js.map
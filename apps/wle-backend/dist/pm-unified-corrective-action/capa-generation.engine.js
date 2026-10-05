"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapaGenerationEngine = void 0;
class CapaGenerationEngine {
    classify(input) {
        let priority = 'medium';
        let verificationRole = 'supervisor';
        let escalationHint = 1;
        if (input.sifLinked || input.severity === 'critical') {
            priority = 'critical';
            verificationRole = 'safety_officer';
            escalationHint = 3;
        }
        else if (input.severity === 'high' || input.equipmentUnsafe) {
            priority = 'high';
            verificationRole = 'safety_officer';
            escalationHint = 2;
        }
        else if (input.trainingExpired || input.accessDenied) {
            priority = 'high';
            verificationRole = 'supervisor';
            escalationHint = 2;
        }
        return { priority, verificationRole, escalationHint };
    }
    buildTrigger(partial) {
        var _a, _b, _c;
        const severity = (_a = partial.severity) !== null && _a !== void 0 ? _a : 'medium';
        const classified = this.classify({
            severity,
            sifLinked: partial.sifLinked,
            equipmentUnsafe: !!partial.equipmentId,
        });
        return {
            sourceModule: partial.sourceModule,
            sourceId: partial.sourceId,
            sourceItemId: partial.sourceItemId,
            title: partial.title,
            description: partial.description,
            actionType: (_b = partial.actionType) !== null && _b !== void 0 ? _b : 'permanent',
            severity,
            hazardId: partial.hazardId,
            controlId: partial.controlId,
            equipmentId: partial.equipmentId,
            workerId: partial.workerId,
            sifLinked: partial.sifLinked,
            hecaLinked: partial.hecaLinked,
            verificationRole: classified.verificationRole,
            linkTypes: (_c = partial.linkTypes) !== null && _c !== void 0 ? _c : [],
        };
    }
}
exports.CapaGenerationEngine = CapaGenerationEngine;
//# sourceMappingURL=capa-generation.engine.js.map
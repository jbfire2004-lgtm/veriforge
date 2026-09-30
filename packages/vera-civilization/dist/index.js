"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = exports.ingestPhases = exports.OfflineCivilizationEngine = exports.CivilizationMemoryEngine = exports.CivilizationDecisionEngine = exports.CivilizationSimulationEngine = exports.CivilizationCoordinationEngine = exports.CivilizationKnowledgeEngine = exports.CivilizationSustainabilityEngine = exports.CivilizationGrowthEngine = exports.CivilizationStabilityEngine = exports.CivilizationEthicsEngine = exports.CivilizationGovernanceEngine = exports.VeraUniversalCivilizationEngine = void 0;
__exportStar(require("./types"), exports);
var vera_universal_civilization_engine_1 = require("./uce/vera-universal-civilization-engine");
Object.defineProperty(exports, "VeraUniversalCivilizationEngine", { enumerable: true, get: function () { return vera_universal_civilization_engine_1.VeraUniversalCivilizationEngine; } });
var civilization_governance_1 = require("./engines/civilization-governance");
Object.defineProperty(exports, "CivilizationGovernanceEngine", { enumerable: true, get: function () { return civilization_governance_1.CivilizationGovernanceEngine; } });
var civilization_ethics_1 = require("./engines/civilization-ethics");
Object.defineProperty(exports, "CivilizationEthicsEngine", { enumerable: true, get: function () { return civilization_ethics_1.CivilizationEthicsEngine; } });
var civilization_stability_1 = require("./engines/civilization-stability");
Object.defineProperty(exports, "CivilizationStabilityEngine", { enumerable: true, get: function () { return civilization_stability_1.CivilizationStabilityEngine; } });
var civilization_growth_1 = require("./engines/civilization-growth");
Object.defineProperty(exports, "CivilizationGrowthEngine", { enumerable: true, get: function () { return civilization_growth_1.CivilizationGrowthEngine; } });
var civilization_sustainability_1 = require("./engines/civilization-sustainability");
Object.defineProperty(exports, "CivilizationSustainabilityEngine", { enumerable: true, get: function () { return civilization_sustainability_1.CivilizationSustainabilityEngine; } });
var civilization_knowledge_1 = require("./engines/civilization-knowledge");
Object.defineProperty(exports, "CivilizationKnowledgeEngine", { enumerable: true, get: function () { return civilization_knowledge_1.CivilizationKnowledgeEngine; } });
var civilization_coordination_1 = require("./engines/civilization-coordination");
Object.defineProperty(exports, "CivilizationCoordinationEngine", { enumerable: true, get: function () { return civilization_coordination_1.CivilizationCoordinationEngine; } });
var civilization_simulation_1 = require("./engines/civilization-simulation");
Object.defineProperty(exports, "CivilizationSimulationEngine", { enumerable: true, get: function () { return civilization_simulation_1.CivilizationSimulationEngine; } });
var civilization_decision_1 = require("./engines/civilization-decision");
Object.defineProperty(exports, "CivilizationDecisionEngine", { enumerable: true, get: function () { return civilization_decision_1.CivilizationDecisionEngine; } });
var civilization_memory_1 = require("./engines/civilization-memory");
Object.defineProperty(exports, "CivilizationMemoryEngine", { enumerable: true, get: function () { return civilization_memory_1.CivilizationMemoryEngine; } });
var offline_civilization_1 = require("./engines/offline-civilization");
Object.defineProperty(exports, "OfflineCivilizationEngine", { enumerable: true, get: function () { return offline_civilization_1.OfflineCivilizationEngine; } });
var phase_integration_1 = require("./integrations/phase-integration");
Object.defineProperty(exports, "ingestPhases", { enumerable: true, get: function () { return phase_integration_1.ingestPhases; } });
var scoring_1 = require("./utils/scoring");
Object.defineProperty(exports, "clamp", { enumerable: true, get: function () { return scoring_1.clamp; } });
//# sourceMappingURL=index.js.map
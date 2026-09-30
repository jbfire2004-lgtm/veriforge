"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realtimeInferenceEngine = exports.RealtimeInferenceEngine = void 0;
const model_cache_1 = require("./model-cache");
const prediction_engine_1 = require("./prediction.engine");
const scoring_engine_1 = require("./scoring.engine");
const safety_gating_engine_1 = require("./safety-gating.engine");
class RealtimeInferenceEngine {
    predict(req) {
        const model = model_cache_1.modelCache.load();
        const signals = req.signals ?? {};
        const workerScore = scoring_engine_1.scoringEngine.workerSafety(signals).score;
        const type = req.predictionType ?? 'incident_likelihood';
        let prediction;
        switch (type) {
            case 'equipment_failure':
                prediction = prediction_engine_1.predictionEngine.equipmentFailure(signals);
                break;
            case 'access_denial':
                prediction = prediction_engine_1.predictionEngine.accessDenial(signals);
                break;
            case 'training_lapse':
                prediction = prediction_engine_1.predictionEngine.trainingLapse(signals);
                break;
            default:
                prediction = prediction_engine_1.predictionEngine.incidentLikelihood(signals, workerScore);
        }
        return { model, prediction, workerScore };
    }
    score(req) {
        const model = model_cache_1.modelCache.load();
        const signals = req.signals ?? {};
        const scoreType = req.scoreType ?? 'worker_safety';
        let result;
        switch (scoreType) {
            case 'equipment_safety':
                result = scoring_engine_1.scoringEngine.equipmentSafety(signals);
                break;
            case 'project_safety':
                result = scoring_engine_1.scoringEngine.projectSafety(signals);
                break;
            default:
                result = scoring_engine_1.scoringEngine.workerSafety(signals);
        }
        return { model, scoreType, ...result };
    }
    gate(req) {
        const model = model_cache_1.modelCache.load();
        const signals = req.signals ?? {};
        const workerResult = scoring_engine_1.scoringEngine.workerSafety(signals);
        const equipmentResult = req.equipmentId
            ? scoring_engine_1.scoringEngine.equipmentSafety(signals)
            : { score: 100, maxScore: 100, components: [] };
        const intelGate = safety_gating_engine_1.safetyGatingEngine.evaluateRealtime(signals, { workerScore: workerResult.score, equipmentScore: equipmentResult.score }, req.activeOverrides);
        let taskGate = null;
        if (req.taskRequirements && Object.keys(req.taskRequirements).length > 0) {
            taskGate = safety_gating_engine_1.safetyGatingEngine.evaluateTaskRequirements(req.workerId ?? 'task', req.taskRequirements, req.taskGateContext ?? {});
            if (!taskGate.passed) {
                intelGate.allowed = false;
                intelGate.blockers.push(taskGate.reason);
                intelGate.blocks.taskStart = true;
                if (req.useCase === 'pm_gating')
                    intelGate.blocks.pmScheduling = true;
            }
        }
        if (req.useCase === 'site_access' && !intelGate.allowed) {
            intelGate.blocks.workerAccess = true;
            intelGate.blocks.zoneAccess = true;
        }
        if (req.useCase === 'safety_station' && !intelGate.allowed) {
            intelGate.blocks.zoneAccess = true;
        }
        const accessPrediction = prediction_engine_1.predictionEngine.accessDenial(signals);
        return {
            model,
            gate: intelGate,
            taskGate,
            workerScore: workerResult.score,
            equipmentScore: equipmentResult.score,
            accessDenialProbability: accessPrediction.probability,
        };
    }
}
exports.RealtimeInferenceEngine = RealtimeInferenceEngine;
exports.realtimeInferenceEngine = new RealtimeInferenceEngine();

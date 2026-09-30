import { modelCache } from './model-cache';
import { predictionEngine } from './prediction.engine';
import { scoringEngine } from './scoring.engine';
import { safetyGatingEngine } from './safety-gating.engine';
import type {
  RealtimeGateRequest,
  RealtimePredictRequest,
  RealtimeScoreRequest,
  RealtimeSignals,
} from '../types';

export class RealtimeInferenceEngine {
  predict(req: RealtimePredictRequest) {
    const model = modelCache.load();
    const signals = req.signals ?? {};
    const workerScore = scoringEngine.workerSafety(signals).score;

    const type = req.predictionType ?? 'incident_likelihood';
    let prediction;
    switch (type) {
      case 'equipment_failure':
        prediction = predictionEngine.equipmentFailure(signals);
        break;
      case 'access_denial':
        prediction = predictionEngine.accessDenial(signals);
        break;
      case 'training_lapse':
        prediction = predictionEngine.trainingLapse(signals);
        break;
      default:
        prediction = predictionEngine.incidentLikelihood(signals, workerScore);
    }

    return { model, prediction, workerScore };
  }

  score(req: RealtimeScoreRequest) {
    const model = modelCache.load();
    const signals = req.signals ?? {};
    const scoreType = req.scoreType ?? 'worker_safety';

    let result;
    switch (scoreType) {
      case 'equipment_safety':
        result = scoringEngine.equipmentSafety(signals);
        break;
      case 'project_safety':
        result = scoringEngine.projectSafety(signals);
        break;
      default:
        result = scoringEngine.workerSafety(signals);
    }

    return { model, scoreType, ...result };
  }

  gate(req: RealtimeGateRequest) {
    const model = modelCache.load();
    const signals = req.signals ?? {};
    const workerResult = scoringEngine.workerSafety(signals);
    const equipmentResult = req.equipmentId
      ? scoringEngine.equipmentSafety(signals)
      : { score: 100, maxScore: 100, components: [] };

    const intelGate = safetyGatingEngine.evaluateRealtime(
      signals,
      { workerScore: workerResult.score, equipmentScore: equipmentResult.score },
      req.activeOverrides,
    );

    let taskGate = null;
    if (req.taskRequirements && Object.keys(req.taskRequirements).length > 0) {
      taskGate = safetyGatingEngine.evaluateTaskRequirements(
        req.workerId ?? 'task',
        req.taskRequirements,
        req.taskGateContext ?? {},
      );
      if (!taskGate.passed) {
        intelGate.allowed = false;
        intelGate.blockers.push(taskGate.reason);
        intelGate.blocks.taskStart = true;
        if (req.useCase === 'pm_gating') intelGate.blocks.pmScheduling = true;
      }
    }

    if (req.useCase === 'site_access' && !intelGate.allowed) {
      intelGate.blocks.workerAccess = true;
      intelGate.blocks.zoneAccess = true;
    }
    if (req.useCase === 'safety_station' && !intelGate.allowed) {
      intelGate.blocks.zoneAccess = true;
    }

    const accessPrediction = predictionEngine.accessDenial(signals);

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

export const realtimeInferenceEngine = new RealtimeInferenceEngine();

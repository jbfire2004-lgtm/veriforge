import type { WorkerSafetyScore } from '../types';

type ScoreContext = {
  profile: { role: string; medicalRestrictions: unknown } | null;
  training: Array<{ expiryDate: Date | null }>;
  authorizations: Array<{ expiryDate: Date | null }>;
  restrictions: Array<{ expiryDate: Date | null }>;
  exposures: Array<{ severity: number; likelihood: number }>;
  incidents: unknown[];
  corrective: Array<{ status: string }>;
  accessLogs: Array<{ granted: boolean }>;
};

export class WorkerScoringEngine {
  compute(workerId: string, companyId: string, ctx: ScoreContext): WorkerSafetyScore {
    const gaps: string[] = [];
    const now = Date.now();

    const validTraining = ctx.training.filter(
      (t) => !t.expiryDate || t.expiryDate.getTime() > now,
    );
    const trainingCompliance =
      ctx.training.length === 0
        ? 0
        : Math.round((validTraining.length / ctx.training.length) * 100);
    if (ctx.training.length === 0) gaps.push('No training records on file');
    if (validTraining.length < ctx.training.length) gaps.push('Expired training certifications');

    const validAuths = ctx.authorizations.filter(
      (a) => !a.expiryDate || a.expiryDate.getTime() > now,
    );
    const authorizationValidity =
      ctx.authorizations.length === 0
        ? 50
        : Math.round((validAuths.length / ctx.authorizations.length) * 100);
    if (validAuths.length < ctx.authorizations.length) gaps.push('Expired equipment authorizations');

    const activeRestrictions = ctx.restrictions.filter(
      (r) => !r.expiryDate || r.expiryDate.getTime() > now,
    );
    const restrictionImpact = Math.max(0, 100 - activeRestrictions.length * 15);
    if (activeRestrictions.length > 0) gaps.push('Active medical restrictions apply');

    let maxExposure = 0;
    for (const e of ctx.exposures) {
      maxExposure = Math.max(maxExposure, e.severity * e.likelihood);
    }
    const exposureRisk = Math.max(0, 100 - maxExposure * 4);
    if (maxExposure >= 16) gaps.push('High hazard exposure recorded');

    const incidentHistory = Math.max(0, 100 - ctx.incidents.length * 20);
    if (ctx.incidents.length > 0) gaps.push('Prior incident involvement');

    const openCapa = ctx.corrective.filter((c) => c.status !== 'closed' && c.status !== 'verified');
    const correctiveActionLoad = Math.max(0, 100 - openCapa.length * 15);
    if (openCapa.length > 0) gaps.push('Open corrective action assignments');

    const denied = ctx.accessLogs.filter((l) => !l.granted).length;
    const accessCompliance =
      ctx.accessLogs.length === 0
        ? 80
        : Math.max(0, 100 - Math.round((denied / ctx.accessLogs.length) * 100));
    if (denied > 0) gaps.push('Site access denials on record');

    const components = {
      trainingCompliance,
      authorizationValidity,
      restrictionImpact,
      exposureRisk,
      incidentHistory,
      correctiveActionLoad,
      accessCompliance,
    };

    const score = Math.round(
      trainingCompliance * 0.25 +
        authorizationValidity * 0.15 +
        restrictionImpact * 0.1 +
        exposureRisk * 0.2 +
        incidentHistory * 0.15 +
        correctiveActionLoad * 0.1 +
        accessCompliance * 0.05,
    );

    let riskLevel = 'low';
    if (score < 40 || maxExposure >= 20) riskLevel = 'critical';
    else if (score < 60 || maxExposure >= 16) riskLevel = 'high';
    else if (score < 80) riskLevel = 'medium';

    return { workerId, companyId, score, riskLevel, components, gaps };
  }
}

export const workerScoringEngine = new WorkerScoringEngine();

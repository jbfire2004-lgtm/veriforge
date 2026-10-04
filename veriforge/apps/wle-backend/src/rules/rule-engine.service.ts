import { Injectable } from '@nestjs/common';

@Injectable()
export class RuleEngineService {
  evaluate({
    worker,
    equipment,
    requiredCerts,
  }: {
    worker: any;
    equipment: any;
    requiredCerts: number[];
  }) {
    const now = new Date();
    const reasons: string[] = [];

    // ---------------------------------------------------------
    // WORKER CERTIFICATIONS
    // ---------------------------------------------------------
    const workerCertIds = (worker.trainingRecords || []).map(
      (t: any) => t.certificationId,
    );

    const missingCertifications = requiredCerts.filter(
      (req) => !workerCertIds.includes(req),
    );

    if (missingCertifications.length > 0) {
      reasons.push('Worker missing required certifications');
    }

    // ---------------------------------------------------------
    // EXPIRED TRAINING
    // ---------------------------------------------------------
    const expiredTraining = (worker.trainingRecords || []).filter(
      (t: any) => t.expiresAt && t.expiresAt <= now,
    );

    if (expiredTraining.length > 0) {
      reasons.push('Worker has expired training');
    }

    // ---------------------------------------------------------
    // EXPIRED CREDENTIALS
    // ---------------------------------------------------------
    const expiredCredentials = (worker.credentials || []).filter(
      (c: any) => c.expiresAt && c.expiresAt <= now,
    );

    if (expiredCredentials.length > 0) {
      reasons.push('Worker has expired credentials');
    }

    // ---------------------------------------------------------
    // WORKER INCIDENTS
    // ---------------------------------------------------------
    const workerIncidents = worker.incidents || [];
    if (workerIncidents.length > 0) {
      reasons.push('Worker involved in incidents');
    }

    // ---------------------------------------------------------
    // EQUIPMENT INCIDENTS
    // ---------------------------------------------------------
    const equipmentIncidents = equipment.incidents || [];
    if (equipmentIncidents.length > 0) {
      reasons.push('Equipment has active incidents');
    }

    // ---------------------------------------------------------
    // FINAL RESULT
    // ---------------------------------------------------------
    const result = reasons.length === 0 ? 'SAFE' : 'UNSAFE';

    return {
      result,
      reasons,
      missingCertifications,
      expiredTraining,
      expiredCredentials,
      workerIncidents,
      equipmentIncidents,
    };
  }
}

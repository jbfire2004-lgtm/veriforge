import { JhaStatus, Prisma } from '@prisma/client';
import { jhaRepository } from '../models/jha.repository';
import { jhaScoringEngine } from '../engines/jha-scoring.engine';
import { sifHecaScoringEngine } from '../engines/sif-heca-scoring.engine';
import { capaHookEngine } from '../engines/capa-hook.engine';
import { offlineSyncEngine } from '../engines/offline-sync.engine';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';
import type { JhaSnapshot, JhaScoreResult, OfflineSyncAction } from '../types';
import { logger } from '../utils/logger';

function toJhaDto(jha: NonNullable<Awaited<ReturnType<typeof jhaRepository.findJha>>>) {
  return {
    id: jha.id,
    companyId: jha.companyId,
    projectId: jha.projectId,
    title: jha.title,
    description: jha.description,
    status: jha.status,
    riskScore: jha.riskScore,
    sifScore: jha.sifScore,
    hecaCategory: jha.hecaCategory,
    version: jha.version,
    createdBy: jha.createdBy,
    approvedBy: jha.approvedBy,
    hazards: jha.hazards.map((h) => ({
      id: h.id,
      hazardId: h.hazardId,
      severity: h.severity,
      likelihood: h.likelihood,
      sifPotential: h.sifPotential,
      hecaCategory: h.hecaCategory,
    })),
    controls: jha.controls.map((c) => ({
      id: c.id,
      controlId: c.controlId,
      controlStrength: c.controlStrength,
    })),
    signatures: jha.signatures.map((s) => ({
      id: s.id,
      workerId: s.workerId,
      signedAt: s.signedAt.toISOString(),
    })),
    createdAt: jha.createdAt.toISOString(),
    updatedAt: jha.updatedAt.toISOString(),
  };
}

function buildSnapshot(jha: NonNullable<Awaited<ReturnType<typeof jhaRepository.findJha>>>): JhaSnapshot {
  return {
    id: jha.id,
    companyId: jha.companyId,
    projectId: jha.projectId,
    title: jha.title,
    description: jha.description,
    status: jha.status,
    riskScore: jha.riskScore,
    sifScore: jha.sifScore,
    hecaCategory: jha.hecaCategory,
    version: jha.version,
    createdBy: jha.createdBy,
    approvedBy: jha.approvedBy,
    hazards: jha.hazards.map((h) => ({
      id: h.id,
      hazardId: h.hazardId,
      severity: h.severity,
      likelihood: h.likelihood,
      sifPotential: h.sifPotential,
      hecaCategory: h.hecaCategory,
    })),
    controls: jha.controls.map((c) => ({
      id: c.id,
      controlId: c.controlId,
      controlStrength: c.controlStrength,
    })),
    signatures: jha.signatures.map((s) => ({
      id: s.id,
      workerId: s.workerId,
      signedAt: s.signedAt.toISOString(),
    })),
  };
}

async function assertEditableJha(jhaId: string, companyId: string) {
  const jha = await jhaRepository.findJha(jhaId, companyId);
  if (!jha) throw new NotFoundError('JHA not found');
  if (jha.status === JhaStatus.approved) {
    throw new ConflictError('Approved JHA cannot be modified');
  }
  return jha;
}

async function recalculateAndPersist(jhaId: string, companyId: string) {
  const jha = await jhaRepository.findJha(jhaId, companyId);
  if (!jha) throw new NotFoundError('JHA not found');

  const score = jhaScoringEngine.evaluate({
    jhaId: jha.id,
    version: jha.version,
    hazards: jha.hazards,
    controls: jha.controls,
    signatureCount: jha.signatures.length,
  });

  await jhaRepository.updateJha(jhaId, companyId, {
    riskScore: score.riskScore,
    sifScore: score.sifScore,
    hecaCategory: score.hecaCategory,
  });

  return score;
}

async function bumpVersion(jhaId: string, companyId: string, reason: string) {
  const jha = await jhaRepository.findJha(jhaId, companyId);
  if (!jha) throw new NotFoundError('JHA not found');

  const newVersion = jha.version + 1;
  const snapshot = buildSnapshot(jha);

  await jhaRepository.createVersion({
    jhaId,
    version: jha.version,
    snapshot: snapshot as unknown as Prisma.InputJsonValue,
  });

  await jhaRepository.updateJha(jhaId, companyId, { version: newVersion });
  logger.info('JHA version bumped', { jhaId, version: newVersion, reason });
  return newVersion;
}

export const jhaService = {
  assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string) {
    if (tokenCompanyId !== requestedCompanyId) {
      throw new ForbiddenError('Cross-company access denied');
    }
  },

  async createJha(input: {
    companyId: string;
    projectId: string;
    title: string;
    description?: string;
    createdBy: string;
  }) {
    const jha = await jhaRepository.createJha(input);
    logger.info('JHA created', { jhaId: jha.id, companyId: input.companyId });
    return toJhaDto(jha);
  },

  async addHazards(input: {
    jhaId: string;
    companyId: string;
    hazards: Array<{
      hazard_id: string;
      severity: number;
      likelihood: number;
    }>;
  }) {
    await assertEditableJha(input.jhaId, input.companyId);

    for (const h of input.hazards) {
      if (h.severity < 1 || h.severity > 5 || h.likelihood < 1 || h.likelihood > 5) {
        throw new BadRequestError('severity and likelihood must be between 1 and 5');
      }

      const hazardScore = sifHecaScoringEngine.score({
        severity: h.severity,
        likelihood: h.likelihood,
        highEnergyCount: 0,
        openCapaCount: 0,
        priorIncidentCount: 0,
      });

      try {
        await jhaRepository.addHazard({
          jhaId: input.jhaId,
          hazardId: h.hazard_id,
          severity: h.severity,
          likelihood: h.likelihood,
          sifPotential: hazardScore.sifPotential,
          hecaCategory: hazardScore.hecaCategory,
        });
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
          throw new ConflictError(`Hazard already linked: ${h.hazard_id}`);
        }
        throw e;
      }
    }

    await bumpVersion(input.jhaId, input.companyId, 'hazards_added');
    const score = await recalculateAndPersist(input.jhaId, input.companyId);

    const jha = await jhaRepository.findJha(input.jhaId, input.companyId);
    return { ...toJhaDto(jha!), score };
  },

  async addControls(input: {
    jhaId: string;
    companyId: string;
    controls: Array<{
      control_id: string;
      control_strength: number;
    }>;
  }) {
    await assertEditableJha(input.jhaId, input.companyId);

    for (const c of input.controls) {
      if (c.control_strength < 1 || c.control_strength > 5) {
        throw new BadRequestError('control_strength must be between 1 and 5');
      }

      try {
        await jhaRepository.addControl({
          jhaId: input.jhaId,
          controlId: c.control_id,
          controlStrength: c.control_strength,
        });
      } catch (e: unknown) {
        if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
          throw new ConflictError(`Control already linked: ${c.control_id}`);
        }
        throw e;
      }
    }

    await bumpVersion(input.jhaId, input.companyId, 'controls_added');
    const score = await recalculateAndPersist(input.jhaId, input.companyId);

    const jha = await jhaRepository.findJha(input.jhaId, input.companyId);
    return { ...toJhaDto(jha!), score };
  },

  async signJha(input: {
    jhaId: string;
    companyId: string;
    workerId: string;
    signatureBlob: string;
  }) {
    await assertEditableJha(input.jhaId, input.companyId);

    if (!input.signatureBlob?.trim()) {
      throw new BadRequestError('signature_blob is required');
    }

    try {
      await jhaRepository.addSignature({
        jhaId: input.jhaId,
        workerId: input.workerId,
        signatureBlob: input.signatureBlob,
      });
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
        throw new ConflictError('Worker has already signed this JHA');
      }
      throw e;
    }

    await jhaRepository.updateJha(input.jhaId, input.companyId, {
      status: JhaStatus.pending_approval,
    });

    await bumpVersion(input.jhaId, input.companyId, 'worker_signed');
    const score = await recalculateAndPersist(input.jhaId, input.companyId);

    const updated = await jhaRepository.findJha(input.jhaId, input.companyId);
    logger.info('JHA signed', { jhaId: input.jhaId, workerId: input.workerId });
    return { ...toJhaDto(updated!), score };
  },

  async approveJha(input: {
    jhaId: string;
    companyId: string;
    approvedBy: string;
    approved?: boolean;
    notes?: string;
  }) {
    const jha = await jhaRepository.findJha(input.jhaId, input.companyId);
    if (!jha) throw new NotFoundError('JHA not found');

    if (jha.status !== JhaStatus.pending_approval && jha.status !== JhaStatus.pending_signatures) {
      throw new BadRequestError(`JHA cannot be approved in status: ${jha.status}`);
    }

    const score = await this.getScore(input.jhaId, input.companyId);

    if (score.blockSubmission && input.approved !== false) {
      throw new BadRequestError(`JHA blocked: ${score.blockReasons.join('; ')}`);
    }

    if (score.supervisorReviewRequired && input.approved === false) {
      await jhaRepository.updateJha(input.jhaId, input.companyId, {
        status: JhaStatus.rejected,
        approvedBy: input.approvedBy,
      });
    } else if (input.approved === false) {
      await jhaRepository.updateJha(input.jhaId, input.companyId, {
        status: JhaStatus.rejected,
        approvedBy: input.approvedBy,
      });
    } else {
      await jhaRepository.updateJha(input.jhaId, input.companyId, {
        status: JhaStatus.approved,
        approvedBy: input.approvedBy,
      });

      const capaResult = await capaHookEngine.trigger({
        jhaId: jha.id,
        companyId: jha.companyId,
        projectId: jha.projectId,
        score,
        title: jha.title,
      });

      await bumpVersion(input.jhaId, input.companyId, 'supervisor_approved');

      const updated = await jhaRepository.findJha(input.jhaId, input.companyId);
      logger.info('JHA approved', {
        jhaId: input.jhaId,
        approvedBy: input.approvedBy,
        capaTriggered: capaResult.triggered,
      });

      return {
        ...toJhaDto(updated!),
        score,
        capa: capaResult,
        notes: input.notes,
      };
    }

    await bumpVersion(input.jhaId, input.companyId, 'supervisor_rejected');
    const updated = await jhaRepository.findJha(input.jhaId, input.companyId);
    return { ...toJhaDto(updated!), score, notes: input.notes };
  },

  async getScore(jhaId: string, companyId: string): Promise<JhaScoreResult> {
    const jha = await jhaRepository.findJha(jhaId, companyId);
    if (!jha) throw new NotFoundError('JHA not found');

    const score = jhaScoringEngine.evaluate({
      jhaId: jha.id,
      version: jha.version,
      hazards: jha.hazards,
      controls: jha.controls,
      signatureCount: jha.signatures.length,
    });

    await jhaRepository.updateJha(jhaId, companyId, {
      riskScore: score.riskScore,
      sifScore: score.sifScore,
      hecaCategory: score.hecaCategory,
    });

    return score;
  },

  async getJha(jhaId: string, companyId: string) {
    const jha = await jhaRepository.findJha(jhaId, companyId);
    if (!jha) throw new NotFoundError('JHA not found');
    return toJhaDto(jha);
  },

  async syncOffline(input: {
    deviceId: string;
    companyId: string;
    userId: string;
    actions: OfflineSyncAction[];
    batchId?: string;
  }) {
    const results = [];
    let synced = 0;
    let failed = 0;

    for (const action of input.actions) {
      const result = await offlineSyncEngine.processAction({
        deviceId: input.deviceId,
        companyId: input.companyId,
        userId: input.userId,
        action,
      });
      results.push(result);
      if (result.ok) synced++;
      else failed++;
    }

    return {
      deviceId: input.deviceId,
      batchId: input.batchId,
      synced,
      failed,
      results,
      canCompleteSync: failed === 0,
    };
  },
};

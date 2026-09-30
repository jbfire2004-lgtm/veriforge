"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jhaService = void 0;
const client_1 = require("@prisma/client");
const jha_repository_1 = require("../models/jha.repository");
const jha_scoring_engine_1 = require("../engines/jha-scoring.engine");
const sif_heca_scoring_engine_1 = require("../engines/sif-heca-scoring.engine");
const capa_hook_engine_1 = require("../engines/capa-hook.engine");
const offline_sync_engine_1 = require("../engines/offline-sync.engine");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function toJhaDto(jha) {
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
function buildSnapshot(jha) {
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
async function assertEditableJha(jhaId, companyId) {
    const jha = await jha_repository_1.jhaRepository.findJha(jhaId, companyId);
    if (!jha)
        throw new errors_1.NotFoundError('JHA not found');
    if (jha.status === client_1.JhaStatus.approved) {
        throw new errors_1.ConflictError('Approved JHA cannot be modified');
    }
    return jha;
}
async function recalculateAndPersist(jhaId, companyId) {
    const jha = await jha_repository_1.jhaRepository.findJha(jhaId, companyId);
    if (!jha)
        throw new errors_1.NotFoundError('JHA not found');
    const score = jha_scoring_engine_1.jhaScoringEngine.evaluate({
        jhaId: jha.id,
        version: jha.version,
        hazards: jha.hazards,
        controls: jha.controls,
        signatureCount: jha.signatures.length,
    });
    await jha_repository_1.jhaRepository.updateJha(jhaId, companyId, {
        riskScore: score.riskScore,
        sifScore: score.sifScore,
        hecaCategory: score.hecaCategory,
    });
    return score;
}
async function bumpVersion(jhaId, companyId, reason) {
    const jha = await jha_repository_1.jhaRepository.findJha(jhaId, companyId);
    if (!jha)
        throw new errors_1.NotFoundError('JHA not found');
    const newVersion = jha.version + 1;
    const snapshot = buildSnapshot(jha);
    await jha_repository_1.jhaRepository.createVersion({
        jhaId,
        version: jha.version,
        snapshot: snapshot,
    });
    await jha_repository_1.jhaRepository.updateJha(jhaId, companyId, { version: newVersion });
    logger_1.logger.info('JHA version bumped', { jhaId, version: newVersion, reason });
    return newVersion;
}
exports.jhaService = {
    assertCompanyAccess(tokenCompanyId, requestedCompanyId) {
        if (tokenCompanyId !== requestedCompanyId) {
            throw new errors_1.ForbiddenError('Cross-company access denied');
        }
    },
    async createJha(input) {
        const jha = await jha_repository_1.jhaRepository.createJha(input);
        logger_1.logger.info('JHA created', { jhaId: jha.id, companyId: input.companyId });
        return toJhaDto(jha);
    },
    async addHazards(input) {
        await assertEditableJha(input.jhaId, input.companyId);
        for (const h of input.hazards) {
            if (h.severity < 1 || h.severity > 5 || h.likelihood < 1 || h.likelihood > 5) {
                throw new errors_1.BadRequestError('severity and likelihood must be between 1 and 5');
            }
            const hazardScore = sif_heca_scoring_engine_1.sifHecaScoringEngine.score({
                severity: h.severity,
                likelihood: h.likelihood,
                highEnergyCount: 0,
                openCapaCount: 0,
                priorIncidentCount: 0,
            });
            try {
                await jha_repository_1.jhaRepository.addHazard({
                    jhaId: input.jhaId,
                    hazardId: h.hazard_id,
                    severity: h.severity,
                    likelihood: h.likelihood,
                    sifPotential: hazardScore.sifPotential,
                    hecaCategory: hazardScore.hecaCategory,
                });
            }
            catch (e) {
                if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
                    throw new errors_1.ConflictError(`Hazard already linked: ${h.hazard_id}`);
                }
                throw e;
            }
        }
        await bumpVersion(input.jhaId, input.companyId, 'hazards_added');
        const score = await recalculateAndPersist(input.jhaId, input.companyId);
        const jha = await jha_repository_1.jhaRepository.findJha(input.jhaId, input.companyId);
        return { ...toJhaDto(jha), score };
    },
    async addControls(input) {
        await assertEditableJha(input.jhaId, input.companyId);
        for (const c of input.controls) {
            if (c.control_strength < 1 || c.control_strength > 5) {
                throw new errors_1.BadRequestError('control_strength must be between 1 and 5');
            }
            try {
                await jha_repository_1.jhaRepository.addControl({
                    jhaId: input.jhaId,
                    controlId: c.control_id,
                    controlStrength: c.control_strength,
                });
            }
            catch (e) {
                if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
                    throw new errors_1.ConflictError(`Control already linked: ${c.control_id}`);
                }
                throw e;
            }
        }
        await bumpVersion(input.jhaId, input.companyId, 'controls_added');
        const score = await recalculateAndPersist(input.jhaId, input.companyId);
        const jha = await jha_repository_1.jhaRepository.findJha(input.jhaId, input.companyId);
        return { ...toJhaDto(jha), score };
    },
    async signJha(input) {
        await assertEditableJha(input.jhaId, input.companyId);
        if (!input.signatureBlob?.trim()) {
            throw new errors_1.BadRequestError('signature_blob is required');
        }
        try {
            await jha_repository_1.jhaRepository.addSignature({
                jhaId: input.jhaId,
                workerId: input.workerId,
                signatureBlob: input.signatureBlob,
            });
        }
        catch (e) {
            if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
                throw new errors_1.ConflictError('Worker has already signed this JHA');
            }
            throw e;
        }
        await jha_repository_1.jhaRepository.updateJha(input.jhaId, input.companyId, {
            status: client_1.JhaStatus.pending_approval,
        });
        await bumpVersion(input.jhaId, input.companyId, 'worker_signed');
        const score = await recalculateAndPersist(input.jhaId, input.companyId);
        const updated = await jha_repository_1.jhaRepository.findJha(input.jhaId, input.companyId);
        logger_1.logger.info('JHA signed', { jhaId: input.jhaId, workerId: input.workerId });
        return { ...toJhaDto(updated), score };
    },
    async approveJha(input) {
        const jha = await jha_repository_1.jhaRepository.findJha(input.jhaId, input.companyId);
        if (!jha)
            throw new errors_1.NotFoundError('JHA not found');
        if (jha.status !== client_1.JhaStatus.pending_approval && jha.status !== client_1.JhaStatus.pending_signatures) {
            throw new errors_1.BadRequestError(`JHA cannot be approved in status: ${jha.status}`);
        }
        const score = await this.getScore(input.jhaId, input.companyId);
        if (score.blockSubmission && input.approved !== false) {
            throw new errors_1.BadRequestError(`JHA blocked: ${score.blockReasons.join('; ')}`);
        }
        if (score.supervisorReviewRequired && input.approved === false) {
            await jha_repository_1.jhaRepository.updateJha(input.jhaId, input.companyId, {
                status: client_1.JhaStatus.rejected,
                approvedBy: input.approvedBy,
            });
        }
        else if (input.approved === false) {
            await jha_repository_1.jhaRepository.updateJha(input.jhaId, input.companyId, {
                status: client_1.JhaStatus.rejected,
                approvedBy: input.approvedBy,
            });
        }
        else {
            await jha_repository_1.jhaRepository.updateJha(input.jhaId, input.companyId, {
                status: client_1.JhaStatus.approved,
                approvedBy: input.approvedBy,
            });
            const capaResult = await capa_hook_engine_1.capaHookEngine.trigger({
                jhaId: jha.id,
                companyId: jha.companyId,
                projectId: jha.projectId,
                score,
                title: jha.title,
            });
            await bumpVersion(input.jhaId, input.companyId, 'supervisor_approved');
            const updated = await jha_repository_1.jhaRepository.findJha(input.jhaId, input.companyId);
            logger_1.logger.info('JHA approved', {
                jhaId: input.jhaId,
                approvedBy: input.approvedBy,
                capaTriggered: capaResult.triggered,
            });
            return {
                ...toJhaDto(updated),
                score,
                capa: capaResult,
                notes: input.notes,
            };
        }
        await bumpVersion(input.jhaId, input.companyId, 'supervisor_rejected');
        const updated = await jha_repository_1.jhaRepository.findJha(input.jhaId, input.companyId);
        return { ...toJhaDto(updated), score, notes: input.notes };
    },
    async getScore(jhaId, companyId) {
        const jha = await jha_repository_1.jhaRepository.findJha(jhaId, companyId);
        if (!jha)
            throw new errors_1.NotFoundError('JHA not found');
        const score = jha_scoring_engine_1.jhaScoringEngine.evaluate({
            jhaId: jha.id,
            version: jha.version,
            hazards: jha.hazards,
            controls: jha.controls,
            signatureCount: jha.signatures.length,
        });
        await jha_repository_1.jhaRepository.updateJha(jhaId, companyId, {
            riskScore: score.riskScore,
            sifScore: score.sifScore,
            hecaCategory: score.hecaCategory,
        });
        return score;
    },
    async getJha(jhaId, companyId) {
        const jha = await jha_repository_1.jhaRepository.findJha(jhaId, companyId);
        if (!jha)
            throw new errors_1.NotFoundError('JHA not found');
        return toJhaDto(jha);
    },
    async syncOffline(input) {
        const results = [];
        let synced = 0;
        let failed = 0;
        for (const action of input.actions) {
            const result = await offline_sync_engine_1.offlineSyncEngine.processAction({
                deviceId: input.deviceId,
                companyId: input.companyId,
                userId: input.userId,
                action,
            });
            results.push(result);
            if (result.ok)
                synced++;
            else
                failed++;
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

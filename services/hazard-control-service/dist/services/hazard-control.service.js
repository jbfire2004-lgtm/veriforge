"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hazardControlService = void 0;
const hazard_control_repository_1 = require("../models/hazard-control.repository");
const sif_heca_scoring_engine_1 = require("../engines/sif-heca-scoring.engine");
const energy_wheel_engine_1 = require("../engines/energy-wheel.engine");
const hazard_control_mapping_engine_1 = require("../engines/hazard-control-mapping.engine");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
function toHazardDto(hazard) {
    if (!hazard)
        return null;
    const energies = energy_wheel_engine_1.energyWheelEngine.detectFromText(`${hazard.title ?? ''} ${hazard.description ?? ''} ${hazard.energyType}`);
    const suggestedControls = energy_wheel_engine_1.energyWheelEngine.suggestControlDescriptions(energies.map((e) => e.energyType));
    const ppe = hazard.requiredPpe;
    const training = hazard.requiredTraining;
    const controls = hazard.controlLinks ?? [];
    const mappingValidation = hazard_control_mapping_engine_1.hazardControlMappingEngine.validateMapping({
        hazardTitle: hazard.title ?? hazard.hazardType,
        linkedControlCount: controls.length,
        ppeCount: ppe.length,
        trainingCount: training.length,
        weakIssues: controls
            .filter((l) => l.control.controlStrength < 3)
            .map((l) => `Weak control: ${l.control.title ?? l.control.id}`),
        sifPotential: hazard.sifPotential,
    });
    return {
        id: hazard.id,
        companyId: hazard.companyId,
        hazardType: hazard.hazardType,
        category: hazard.category,
        energyType: hazard.energyType,
        severity: hazard.severity,
        likelihood: hazard.likelihood,
        sifPotential: hazard.sifPotential,
        hecaCategory: hazard.hecaCategory,
        requiredControls: hazard.requiredControls,
        requiredTraining: hazard.requiredTraining,
        requiredPpe: hazard.requiredPpe,
        version: hazard.version,
        title: hazard.title,
        description: hazard.description,
        controls: controls.map((l) => ({
            id: l.control.id,
            controlType: l.control.controlType,
            hierarchyLevel: l.control.hierarchyLevel,
            controlStrength: l.control.controlStrength,
            title: l.control.title,
        })),
        energyWheel: {
            detections: energies,
            suggestedControls,
            aggregateSeverity: energy_wheel_engine_1.energyWheelEngine.aggregateEnergySeverity(energies),
        },
        mappingValidation,
        createdAt: hazard.createdAt.toISOString(),
        updatedAt: hazard.updatedAt.toISOString(),
    };
}
function toControlDto(control) {
    if (!control)
        return null;
    return {
        id: control.id,
        companyId: control.companyId,
        controlType: control.controlType,
        hierarchyLevel: control.hierarchyLevel,
        controlStrength: control.controlStrength,
        verificationSteps: control.verificationSteps,
        requiredTraining: control.requiredTraining,
        requiredPpe: control.requiredPpe,
        version: control.version,
        title: control.title,
        description: control.description,
        hazards: control.hazardLinks.map((l) => ({
            id: l.hazard.id,
            hazardType: l.hazard.hazardType,
            title: l.hazard.title,
        })),
        createdAt: control.createdAt.toISOString(),
        updatedAt: control.updatedAt.toISOString(),
    };
}
exports.hazardControlService = {
    assertCompanyAccess(tokenCompanyId, requestedCompanyId) {
        if (tokenCompanyId !== requestedCompanyId) {
            throw new errors_1.ForbiddenError('Cross-company access denied');
        }
    },
    async createHazard(input) {
        if (input.severity < 1 || input.severity > 5 || input.likelihood < 1 || input.likelihood > 5) {
            throw new errors_1.BadRequestError('severity and likelihood must be between 1 and 5');
        }
        const text = `${input.title ?? ''} ${input.description ?? ''}`;
        const energies = energy_wheel_engine_1.energyWheelEngine.detectFromText(text);
        const highEnergyCount = energies.filter((e) => e.highEnergyFlag).length;
        const score = sif_heca_scoring_engine_1.sifHecaScoringEngine.score({
            severity: input.severity,
            likelihood: input.likelihood,
            highEnergyCount,
            openCapaCount: 0,
            priorIncidentCount: 0,
        });
        const suggested = energy_wheel_engine_1.energyWheelEngine.suggestControlDescriptions(energies.map((e) => e.energyType));
        const hazard = await hazard_control_repository_1.hazardControlRepository.createHazard({
            ...input,
            sifPotential: score.sifPotential,
            hecaCategory: score.hecaCategory,
            requiredControls: input.requiredControls ?? suggested,
            requiredTraining: input.requiredTraining ?? [],
            requiredPpe: input.requiredPpe ?? [],
        });
        logger_1.logger.info('hazard created', { hazardId: hazard.id, companyId: input.companyId });
        return toHazardDto(await hazard_control_repository_1.hazardControlRepository.findHazard(hazard.id, input.companyId));
    },
    async createControl(input) {
        if (input.controlStrength < 1 || input.controlStrength > 5) {
            throw new errors_1.BadRequestError('controlStrength must be between 1 and 5');
        }
        const control = await hazard_control_repository_1.hazardControlRepository.createControl(input);
        logger_1.logger.info('control created', { controlId: control.id, companyId: input.companyId });
        return toControlDto(await hazard_control_repository_1.hazardControlRepository.findControl(control.id, input.companyId));
    },
    async mapControls(input) {
        const hazard = await hazard_control_repository_1.hazardControlRepository.findHazard(input.hazardId, input.companyId);
        if (!hazard)
            throw new errors_1.NotFoundError('Hazard not found');
        const links = [];
        for (const controlId of input.controlIds) {
            const control = await hazard_control_repository_1.hazardControlRepository.findControl(controlId, input.companyId);
            if (!control)
                throw new errors_1.NotFoundError(`Control not found: ${controlId}`);
            try {
                const link = await hazard_control_repository_1.hazardControlRepository.linkHazardControl(input.hazardId, controlId);
                links.push(link);
            }
            catch (e) {
                if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
                    throw new errors_1.ConflictError('Hazard-control mapping already exists');
                }
                throw e;
            }
        }
        await hazard_control_repository_1.hazardControlRepository.updateHazard(input.hazardId, input.companyId, {
            version: hazard.version + 1,
        });
        return {
            hazardId: input.hazardId,
            linked: links.length,
            mapping: hazard_control_mapping_engine_1.hazardControlMappingEngine.validateMapping({
                hazardTitle: hazard.title ?? hazard.hazardType,
                linkedControlCount: await hazard_control_repository_1.hazardControlRepository.countHazardControls(input.hazardId),
                ppeCount: hazard.requiredPpe.length,
                trainingCount: hazard.requiredTraining.length,
                weakIssues: [],
                sifPotential: hazard.sifPotential,
            }),
        };
    },
    async scoreSifHeca(input) {
        const hazard = await hazard_control_repository_1.hazardControlRepository.findHazard(input.hazardId, input.companyId);
        if (!hazard)
            throw new errors_1.NotFoundError('Hazard not found');
        const energies = energy_wheel_engine_1.energyWheelEngine.detectFromText(`${hazard.title ?? ''} ${hazard.description ?? ''}`);
        const score = sif_heca_scoring_engine_1.sifHecaScoringEngine.score({
            severity: hazard.severity,
            likelihood: hazard.likelihood,
            highEnergyCount: input.highEnergyCount ?? energies.filter((e) => e.highEnergyFlag).length,
            openCapaCount: input.openCapaCount ?? 0,
            priorIncidentCount: input.priorIncidentCount ?? 0,
        });
        await hazard_control_repository_1.hazardControlRepository.updateHazard(input.hazardId, input.companyId, {
            sifPotential: score.sifPotential,
            hecaCategory: score.hecaCategory,
            version: hazard.version + 1,
        });
        return { hazardId: input.hazardId, ...score };
    },
    async getHazard(id, companyId) {
        const hazard = await hazard_control_repository_1.hazardControlRepository.findHazard(id, companyId);
        if (!hazard)
            throw new errors_1.NotFoundError('Hazard not found');
        return toHazardDto(hazard);
    },
    async getControl(id, companyId) {
        const control = await hazard_control_repository_1.hazardControlRepository.findControl(id, companyId);
        if (!control)
            throw new errors_1.NotFoundError('Control not found');
        return toControlDto(control);
    },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hazardControlRepository = void 0;
const prisma_1 = require("../db/prisma");
function jsonArray(value) {
    return (Array.isArray(value) ? value : []);
}
exports.hazardControlRepository = {
    createHazard(data) {
        return prisma_1.prisma.hazard.create({
            data: {
                companyId: data.companyId,
                hazardType: data.hazardType,
                category: data.category,
                energyType: data.energyType,
                severity: data.severity,
                likelihood: data.likelihood,
                sifPotential: data.sifPotential ?? false,
                hecaCategory: data.hecaCategory,
                requiredControls: jsonArray(data.requiredControls),
                requiredTraining: jsonArray(data.requiredTraining),
                requiredPpe: jsonArray(data.requiredPpe),
                title: data.title,
                description: data.description,
            },
        });
    },
    async updateHazard(id, companyId, data) {
        const existing = await prisma_1.prisma.hazard.findFirst({ where: { id, companyId } });
        if (!existing)
            return null;
        return prisma_1.prisma.hazard.update({
            where: { id },
            data: {
                ...data,
                requiredControls: data.requiredControls
                    ? jsonArray(data.requiredControls)
                    : undefined,
                requiredTraining: data.requiredTraining
                    ? jsonArray(data.requiredTraining)
                    : undefined,
                requiredPpe: data.requiredPpe ? jsonArray(data.requiredPpe) : undefined,
            },
        });
    },
    findHazard(id, companyId) {
        return prisma_1.prisma.hazard.findFirst({
            where: { id, companyId },
            include: {
                controlLinks: { include: { control: true } },
            },
        });
    },
    createControl(data) {
        return prisma_1.prisma.control.create({
            data: {
                companyId: data.companyId,
                controlType: data.controlType,
                hierarchyLevel: data.hierarchyLevel,
                controlStrength: data.controlStrength,
                verificationSteps: jsonArray(data.verificationSteps),
                requiredTraining: jsonArray(data.requiredTraining),
                requiredPpe: jsonArray(data.requiredPpe),
                title: data.title,
                description: data.description,
            },
        });
    },
    findControl(id, companyId) {
        return prisma_1.prisma.control.findFirst({
            where: { id, companyId },
            include: {
                hazardLinks: { include: { hazard: true } },
            },
        });
    },
    async linkHazardControl(hazardId, controlId) {
        return prisma_1.prisma.hazardControl.create({
            data: { hazardId, controlId },
        });
    },
    countHazardControls(hazardId) {
        return prisma_1.prisma.hazardControl.count({ where: { hazardId } });
    },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectSafetyRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
function json(value) {
    return (value ?? []);
}
exports.projectSafetyRepository = {
    findProfile(projectId, companyId) {
        return prisma_1.prisma.projectSafetyProfile.findFirst({
            where: { projectId, companyId },
        });
    },
    upsertProfile(data) {
        const publish = data.publish === true;
        return prisma_1.prisma.projectSafetyProfile.upsert({
            where: { projectId: data.projectId },
            create: {
                companyId: data.companyId,
                projectId: data.projectId,
                riskLevel: data.riskLevel ?? 'medium',
                requiredJhaTypes: json(data.requiredJhaTypes ?? []),
                requiredInspections: json(data.requiredInspections ?? []),
                requiredTraining: json(data.requiredTraining ?? []),
                requiredEquipmentCertifications: json(data.requiredEquipmentCertifications ?? []),
                requiredPpe: json(data.requiredPpe ?? []),
                requiredEmergencyPlans: json(data.requiredEmergencyPlans ?? []),
                status: publish ? client_1.PublishStatus.published : client_1.PublishStatus.draft,
                publishedAt: publish ? new Date() : undefined,
            },
            update: {
                riskLevel: data.riskLevel,
                requiredJhaTypes: data.requiredJhaTypes != null ? json(data.requiredJhaTypes) : undefined,
                requiredInspections: data.requiredInspections != null ? json(data.requiredInspections) : undefined,
                requiredTraining: data.requiredTraining != null ? json(data.requiredTraining) : undefined,
                requiredEquipmentCertifications: data.requiredEquipmentCertifications != null
                    ? json(data.requiredEquipmentCertifications)
                    : undefined,
                requiredPpe: data.requiredPpe != null ? json(data.requiredPpe) : undefined,
                requiredEmergencyPlans: data.requiredEmergencyPlans != null ? json(data.requiredEmergencyPlans) : undefined,
                status: publish ? client_1.PublishStatus.published : undefined,
                publishedAt: publish ? new Date() : undefined,
                version: publish ? { increment: 1 } : undefined,
            },
        });
    },
    createProfileVersion(data) {
        return prisma_1.prisma.projectSafetyProfileVersion.create({ data });
    },
    bumpProfileVersion(projectId, companyId, version) {
        return prisma_1.prisma.projectSafetyProfile.updateMany({
            where: { projectId, companyId },
            data: { version },
        });
    },
    upsertHazard(data) {
        return prisma_1.prisma.projectHazardLibrary.upsert({
            where: { projectId_hazardId: { projectId: data.projectId, hazardId: data.hazardId } },
            create: {
                companyId: data.companyId,
                projectId: data.projectId,
                hazardId: data.hazardId,
                title: data.title,
                severity: data.severity,
                likelihood: data.likelihood,
                sifPotential: data.sifPotential,
                hecaCategory: data.hecaCategory,
                requiredControls: json(data.requiredControls ?? []),
                status: data.publish ? client_1.PublishStatus.published : client_1.PublishStatus.draft,
            },
            update: {
                title: data.title,
                severity: data.severity,
                likelihood: data.likelihood,
                sifPotential: data.sifPotential,
                hecaCategory: data.hecaCategory,
                requiredControls: data.requiredControls != null ? json(data.requiredControls) : undefined,
                version: data.version,
                status: data.publish ? client_1.PublishStatus.published : undefined,
            },
        });
    },
    upsertControl(data) {
        return prisma_1.prisma.projectControlLibrary.upsert({
            where: { projectId_controlId: { projectId: data.projectId, controlId: data.controlId } },
            create: {
                companyId: data.companyId,
                projectId: data.projectId,
                controlId: data.controlId,
                title: data.title,
                controlStrength: data.controlStrength,
                verificationSteps: json(data.verificationSteps ?? []),
                status: data.publish ? client_1.PublishStatus.published : client_1.PublishStatus.draft,
            },
            update: {
                title: data.title,
                controlStrength: data.controlStrength,
                verificationSteps: data.verificationSteps != null ? json(data.verificationSteps) : undefined,
                version: data.version,
                status: data.publish ? client_1.PublishStatus.published : undefined,
            },
        });
    },
    createZone(data) {
        return prisma_1.prisma.projectZone.create({ data });
    },
    upsertZoneRule(data) {
        return prisma_1.prisma.projectZoneRule.findFirst({ where: { zoneId: data.zoneId } }).then((row) => {
            if (row) {
                return prisma_1.prisma.projectZoneRule.update({
                    where: { id: row.id },
                    data: {
                        requiredTraining: data.requiredTraining != null ? json(data.requiredTraining) : undefined,
                        requiredPpe: data.requiredPpe != null ? json(data.requiredPpe) : undefined,
                        requiredJha: data.requiredJha != null ? json(data.requiredJha) : undefined,
                        requiredPermits: data.requiredPermits != null ? json(data.requiredPermits) : undefined,
                        requiredEquipmentAuthorization: data.requiredEquipmentAuthorization != null
                            ? json(data.requiredEquipmentAuthorization)
                            : undefined,
                        requiredSds: data.requiredSds != null ? json(data.requiredSds) : undefined,
                        version: data.version,
                    },
                });
            }
            return prisma_1.prisma.projectZoneRule.create({
                data: {
                    zoneId: data.zoneId,
                    requiredTraining: json(data.requiredTraining ?? []),
                    requiredPpe: json(data.requiredPpe ?? []),
                    requiredJha: json(data.requiredJha ?? []),
                    requiredPermits: json(data.requiredPermits ?? []),
                    requiredEquipmentAuthorization: json(data.requiredEquipmentAuthorization ?? []),
                    requiredSds: json(data.requiredSds ?? []),
                },
            });
        });
    },
    findZone(id, projectId, companyId) {
        return prisma_1.prisma.projectZone.findFirst({
            where: { id, projectId, companyId },
            include: { rules: true },
        });
    },
    upsertEquipmentRule(data) {
        return prisma_1.prisma.projectEquipmentRule.upsert({
            where: { projectId_ruleKey: { projectId: data.projectId, ruleKey: data.ruleKey } },
            create: {
                companyId: data.companyId,
                projectId: data.projectId,
                ruleKey: data.ruleKey,
                requiredInspections: json(data.requiredInspections ?? []),
                requiredCerts: json(data.requiredCerts ?? []),
                requiredControls: json(data.requiredControls ?? []),
            },
            update: {
                requiredInspections: data.requiredInspections != null ? json(data.requiredInspections) : undefined,
                requiredCerts: data.requiredCerts != null ? json(data.requiredCerts) : undefined,
                requiredControls: data.requiredControls != null ? json(data.requiredControls) : undefined,
                version: data.version,
            },
        });
    },
    upsertTraining(data) {
        return prisma_1.prisma.projectTrainingRequirement.upsert({
            where: { projectId_role: { projectId: data.projectId, role: data.role } },
            create: {
                companyId: data.companyId,
                projectId: data.projectId,
                role: data.role,
                requiredCourses: json(data.requiredCourses),
            },
            update: {
                requiredCourses: json(data.requiredCourses),
                version: data.version,
            },
        });
    },
    createEmergency(data) {
        return prisma_1.prisma.projectEmergencyRequirement.create({
            data: {
                companyId: data.companyId,
                projectId: data.projectId,
                planType: data.planType,
                title: data.title,
                content: json(data.content ?? {}),
                status: data.publish ? client_1.PublishStatus.published : client_1.PublishStatus.draft,
            },
        });
    },
    async getScoreContext(projectId, companyId) {
        const [profile, hazards, controls, zones, training, emergency, equipment] = await Promise.all([
            this.findProfile(projectId, companyId),
            prisma_1.prisma.projectHazardLibrary.findMany({ where: { projectId, companyId } }),
            prisma_1.prisma.projectControlLibrary.findMany({ where: { projectId, companyId } }),
            prisma_1.prisma.projectZone.findMany({
                where: { projectId, companyId },
                include: { rules: true },
            }),
            prisma_1.prisma.projectTrainingRequirement.findMany({ where: { projectId, companyId } }),
            prisma_1.prisma.projectEmergencyRequirement.findMany({ where: { projectId, companyId } }),
            prisma_1.prisma.projectEquipmentRule.findMany({ where: { projectId, companyId } }),
        ]);
        return { profile, hazards, controls, zones, training, emergency, equipment };
    },
};

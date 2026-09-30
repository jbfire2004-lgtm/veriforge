"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companySafetyRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
function json(value) {
    return (value ?? []);
}
exports.companySafetyRepository = {
    findProfile(companyId) {
        return prisma_1.prisma.companySafetyProfile.findUnique({ where: { companyId } });
    },
    upsertProfile(data) {
        const publish = data.publish === true;
        return prisma_1.prisma.companySafetyProfile.upsert({
            where: { companyId: data.companyId },
            create: {
                companyId: data.companyId,
                corporateRiskLevel: data.corporateRiskLevel ?? 'medium',
                corporatePolicies: json(data.corporatePolicies ?? []),
                corporatePpeStandards: json(data.corporatePpeStandards ?? []),
                status: publish ? client_1.PublishStatus.published : client_1.PublishStatus.draft,
                publishedAt: publish ? new Date() : undefined,
            },
            update: {
                corporateRiskLevel: data.corporateRiskLevel,
                corporatePolicies: data.corporatePolicies != null ? json(data.corporatePolicies) : undefined,
                corporatePpeStandards: data.corporatePpeStandards != null ? json(data.corporatePpeStandards) : undefined,
                status: publish ? client_1.PublishStatus.published : undefined,
                publishedAt: publish ? new Date() : undefined,
                version: publish ? { increment: 1 } : undefined,
            },
        });
    },
    createProfileVersion(data) {
        return prisma_1.prisma.companySafetyProfileVersion.create({ data });
    },
    bumpProfileVersion(companyId, version) {
        return prisma_1.prisma.companySafetyProfile.update({
            where: { companyId },
            data: { version },
        });
    },
    upsertHazard(data) {
        return prisma_1.prisma.companyHazardLibrary.upsert({
            where: { companyId_hazardId: { companyId: data.companyId, hazardId: data.hazardId } },
            create: {
                companyId: data.companyId,
                hazardId: data.hazardId,
                title: data.title,
                severity: data.severity,
                likelihood: data.likelihood,
                sifPotential: data.sifPotential,
                hecaCategory: data.hecaCategory,
                requiredControls: json(data.requiredControls ?? []),
                requiredTraining: json(data.requiredTraining ?? []),
                status: data.publish ? client_1.PublishStatus.published : client_1.PublishStatus.draft,
            },
            update: {
                title: data.title,
                severity: data.severity,
                likelihood: data.likelihood,
                sifPotential: data.sifPotential,
                hecaCategory: data.hecaCategory,
                requiredControls: data.requiredControls != null ? json(data.requiredControls) : undefined,
                requiredTraining: data.requiredTraining != null ? json(data.requiredTraining) : undefined,
                version: data.version,
                status: data.publish ? client_1.PublishStatus.published : undefined,
            },
        });
    },
    upsertControl(data) {
        return prisma_1.prisma.companyControlLibrary.upsert({
            where: { companyId_controlId: { companyId: data.companyId, controlId: data.controlId } },
            create: {
                companyId: data.companyId,
                controlId: data.controlId,
                title: data.title,
                controlStrength: data.controlStrength,
                verificationSteps: json(data.verificationSteps ?? []),
                requiredTraining: json(data.requiredTraining ?? []),
                status: data.publish ? client_1.PublishStatus.published : client_1.PublishStatus.draft,
            },
            update: {
                title: data.title,
                controlStrength: data.controlStrength,
                verificationSteps: data.verificationSteps != null ? json(data.verificationSteps) : undefined,
                requiredTraining: data.requiredTraining != null ? json(data.requiredTraining) : undefined,
                version: data.version,
                status: data.publish ? client_1.PublishStatus.published : undefined,
            },
        });
    },
    upsertTraining(data) {
        return prisma_1.prisma.companyTrainingMatrix.upsert({
            where: { companyId_role: { companyId: data.companyId, role: data.role } },
            create: {
                companyId: data.companyId,
                role: data.role,
                requiredCourses: json(data.requiredCourses),
            },
            update: {
                requiredCourses: json(data.requiredCourses),
                version: data.version,
            },
        });
    },
    createPolicy(data) {
        return prisma_1.prisma.companyPolicy.create({
            data: {
                companyId: data.companyId,
                policyType: data.policyType,
                title: data.title,
                content: json(data.content ?? {}),
                requiresAckForAccess: data.requiresAckForAccess ?? true,
                status: data.publish ? client_1.PublishStatus.published : client_1.PublishStatus.draft,
            },
        });
    },
    createSds(data) {
        return prisma_1.prisma.companySdsLibrary.create({
            data: {
                companyId: data.companyId,
                productName: data.productName,
                casNumber: data.casNumber,
                whmisClassification: data.whmisClassification,
                ppeRequirements: json(data.ppeRequirements ?? []),
                filePath: data.filePath,
                status: data.publish ? client_1.PublishStatus.published : client_1.PublishStatus.draft,
            },
        });
    },
    createEmergencyPlan(data) {
        return prisma_1.prisma.companyEmergencyPlan.create({
            data: {
                companyId: data.companyId,
                planType: data.planType,
                title: data.title,
                content: json(data.content ?? {}),
                status: data.publish ? client_1.PublishStatus.published : client_1.PublishStatus.draft,
            },
        });
    },
    upsertEquipmentRule(data) {
        return prisma_1.prisma.companyEquipmentRule.upsert({
            where: { companyId_ruleKey: { companyId: data.companyId, ruleKey: data.ruleKey } },
            create: {
                companyId: data.companyId,
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
    upsertZoneTemplate(data) {
        return prisma_1.prisma.companyZoneTemplate.upsert({
            where: {
                companyId_templateCode: { companyId: data.companyId, templateCode: data.templateCode },
            },
            create: {
                companyId: data.companyId,
                templateCode: data.templateCode,
                zoneType: data.zoneType,
                title: data.title,
                requiredTraining: json(data.requiredTraining ?? []),
                requiredPpe: json(data.requiredPpe ?? []),
                requiresJha: data.requiresJha ?? false,
                highRisk: data.highRisk ?? false,
            },
            update: {
                zoneType: data.zoneType,
                title: data.title,
                requiredTraining: data.requiredTraining != null ? json(data.requiredTraining) : undefined,
                requiredPpe: data.requiredPpe != null ? json(data.requiredPpe) : undefined,
                requiresJha: data.requiresJha,
                highRisk: data.highRisk,
                version: data.version,
            },
        });
    },
    async getBundle(companyId) {
        const [profile, hazards, controls, trainingMatrix, policies, sds, emergencyPlans, equipmentRules, zoneTemplates,] = await Promise.all([
            this.findProfile(companyId),
            prisma_1.prisma.companyHazardLibrary.findMany({ where: { companyId } }),
            prisma_1.prisma.companyControlLibrary.findMany({ where: { companyId } }),
            prisma_1.prisma.companyTrainingMatrix.findMany({ where: { companyId } }),
            prisma_1.prisma.companyPolicy.findMany({ where: { companyId } }),
            prisma_1.prisma.companySdsLibrary.findMany({ where: { companyId } }),
            prisma_1.prisma.companyEmergencyPlan.findMany({ where: { companyId } }),
            prisma_1.prisma.companyEquipmentRule.findMany({ where: { companyId } }),
            prisma_1.prisma.companyZoneTemplate.findMany({ where: { companyId } }),
        ]);
        return {
            profile,
            hazards,
            controls,
            trainingMatrix,
            policies,
            sds,
            emergencyPlans,
            equipmentRules,
            zoneTemplates,
        };
    },
};

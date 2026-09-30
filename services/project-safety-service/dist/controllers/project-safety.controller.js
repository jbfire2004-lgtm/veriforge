"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectSafetyController = void 0;
const project_safety_service_1 = require("../services/project-safety.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
function idsFromBody(req) {
    const companyId = (req.body.company_id ?? req.body.companyId);
    const projectId = (req.body.project_id ?? req.body.projectId);
    return { companyId, projectId };
}
exports.projectSafetyController = {
    async profile(req, res, next) {
        try {
            const { companyId, projectId } = idsFromBody(req);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const profile = await project_safety_service_1.projectSafetyService.upsertProfile({
                companyId,
                projectId,
                riskLevel: req.body.risk_level ?? req.body.riskLevel,
                requiredJhaTypes: req.body.required_jha_types ?? req.body.requiredJhaTypes,
                requiredInspections: req.body.required_inspections ?? req.body.requiredInspections,
                requiredTraining: req.body.required_training ?? req.body.requiredTraining,
                requiredEquipmentCertifications: req.body.required_equipment_certifications ?? req.body.requiredEquipmentCertifications,
                requiredPpe: req.body.required_ppe ?? req.body.requiredPpe,
                requiredEmergencyPlans: req.body.required_emergency_plans ?? req.body.requiredEmergencyPlans,
                publish: req.body.publish,
            });
            return res.status(201).json(profile);
        }
        catch (e) {
            next(e);
        }
    },
    async hazards(req, res, next) {
        try {
            const { companyId, projectId } = idsFromBody(req);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const hazard = await project_safety_service_1.projectSafetyService.addHazard({
                companyId,
                projectId,
                hazardId: req.body.hazard_id ?? req.body.hazardId,
                title: req.body.title,
                severity: Number(req.body.severity),
                likelihood: Number(req.body.likelihood),
                requiredControls: req.body.required_controls ?? req.body.requiredControls,
                publish: req.body.publish,
            });
            return res.status(201).json(hazard);
        }
        catch (e) {
            next(e);
        }
    },
    async controls(req, res, next) {
        try {
            const { companyId, projectId } = idsFromBody(req);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const control = await project_safety_service_1.projectSafetyService.addControl({
                companyId,
                projectId,
                controlId: req.body.control_id ?? req.body.controlId,
                title: req.body.title,
                controlStrength: Number(req.body.control_strength ?? req.body.controlStrength),
                verificationSteps: req.body.verification_steps ?? req.body.verificationSteps,
                publish: req.body.publish,
            });
            return res.status(201).json(control);
        }
        catch (e) {
            next(e);
        }
    },
    async zones(req, res, next) {
        try {
            const { companyId, projectId } = idsFromBody(req);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const zone = await project_safety_service_1.projectSafetyService.addZone({
                companyId,
                projectId,
                name: req.body.name,
                type: req.body.type,
                location: req.body.location,
                riskLevel: req.body.risk_level ?? req.body.riskLevel,
                rules: {
                    requiredTraining: req.body.required_training ?? req.body.requiredTraining,
                    requiredPpe: req.body.required_ppe ?? req.body.requiredPpe,
                    requiredJha: req.body.required_jha ?? req.body.requiredJha,
                    requiredPermits: req.body.required_permits ?? req.body.requiredPermits,
                    requiredEquipmentAuthorization: req.body.required_equipment_authorization ?? req.body.requiredEquipmentAuthorization,
                    requiredSds: req.body.required_sds ?? req.body.requiredSds,
                },
            });
            return res.status(201).json(zone);
        }
        catch (e) {
            next(e);
        }
    },
    async equipment(req, res, next) {
        try {
            const { companyId, projectId } = idsFromBody(req);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const rule = await project_safety_service_1.projectSafetyService.upsertEquipment({
                companyId,
                projectId,
                ruleKey: req.body.rule_key ?? req.body.ruleKey,
                requiredInspections: req.body.required_inspections ?? req.body.requiredInspections,
                requiredCerts: req.body.required_certs ?? req.body.requiredCerts,
                requiredControls: req.body.required_controls ?? req.body.requiredControls,
            });
            return res.status(201).json(rule);
        }
        catch (e) {
            next(e);
        }
    },
    async training(req, res, next) {
        try {
            const { companyId, projectId } = idsFromBody(req);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const row = await project_safety_service_1.projectSafetyService.upsertTraining({
                companyId,
                projectId,
                role: req.body.role,
                requiredCourses: req.body.required_courses ?? req.body.requiredCourses ?? [],
            });
            return res.status(201).json(row);
        }
        catch (e) {
            next(e);
        }
    },
    async emergency(req, res, next) {
        try {
            const { companyId, projectId } = idsFromBody(req);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const plan = await project_safety_service_1.projectSafetyService.createEmergency({
                companyId,
                projectId,
                planType: req.body.plan_type ?? req.body.planType,
                title: req.body.title,
                content: req.body.content,
                publish: req.body.publish,
            });
            return res.status(201).json(plan);
        }
        catch (e) {
            next(e);
        }
    },
    async score(req, res, next) {
        try {
            const projectId = routeParam(req.params.project_id);
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const score = await project_safety_service_1.projectSafetyService.getScore(projectId, companyId);
            return res.json(score);
        }
        catch (e) {
            next(e);
        }
    },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.controlController = void 0;
const hazard_control_service_1 = require("../services/hazard-control.service");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.controlController = {
    async create(req, res, next) {
        try {
            const companyId = req.body.company_id;
            hazard_control_service_1.hazardControlService.assertCompanyAccess(req.companyId, companyId);
            const control = await hazard_control_service_1.hazardControlService.createControl({
                companyId,
                controlType: req.body.control_type,
                hierarchyLevel: Number(req.body.hierarchy_level),
                controlStrength: Number(req.body.control_strength),
                verificationSteps: req.body.verification_steps,
                requiredTraining: req.body.required_training,
                requiredPpe: req.body.required_ppe,
                title: req.body.title,
                description: req.body.description,
            });
            return res.status(201).json(control);
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            hazard_control_service_1.hazardControlService.assertCompanyAccess(req.companyId, companyId);
            const control = await hazard_control_service_1.hazardControlService.getControl(routeParam(req.params.id), companyId);
            return res.json(control);
        }
        catch (e) {
            next(e);
        }
    },
};

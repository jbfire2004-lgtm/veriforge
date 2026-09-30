"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hazardController = void 0;
const hazard_control_service_1 = require("../services/hazard-control.service");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.hazardController = {
    async create(req, res, next) {
        try {
            const companyId = req.body.company_id;
            hazard_control_service_1.hazardControlService.assertCompanyAccess(req.companyId, companyId);
            const hazard = await hazard_control_service_1.hazardControlService.createHazard({
                companyId,
                hazardType: req.body.hazard_type,
                category: req.body.category,
                energyType: req.body.energy_type,
                severity: Number(req.body.severity),
                likelihood: Number(req.body.likelihood),
                title: req.body.title,
                description: req.body.description,
                requiredControls: req.body.required_controls,
                requiredTraining: req.body.required_training,
                requiredPpe: req.body.required_ppe,
            });
            return res.status(201).json(hazard);
        }
        catch (e) {
            next(e);
        }
    },
    async mapControls(req, res, next) {
        try {
            const companyId = req.body.company_id;
            hazard_control_service_1.hazardControlService.assertCompanyAccess(req.companyId, companyId);
            const result = await hazard_control_service_1.hazardControlService.mapControls({
                companyId,
                hazardId: req.body.hazard_id,
                controlIds: req.body.control_ids,
            });
            return res.status(201).json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async sifHeca(req, res, next) {
        try {
            const companyId = req.body.company_id;
            hazard_control_service_1.hazardControlService.assertCompanyAccess(req.companyId, companyId);
            const result = await hazard_control_service_1.hazardControlService.scoreSifHeca({
                companyId,
                hazardId: req.body.hazard_id,
                highEnergyCount: req.body.high_energy_count,
                openCapaCount: req.body.open_capa_count,
                priorIncidentCount: req.body.prior_incident_count,
            });
            return res.json(result);
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = req.query.company_id || req.companyId;
            hazard_control_service_1.hazardControlService.assertCompanyAccess(req.companyId, companyId);
            const hazard = await hazard_control_service_1.hazardControlService.getHazard(routeParam(req.params.id), companyId);
            return res.json(hazard);
        }
        catch (e) {
            next(e);
        }
    },
};

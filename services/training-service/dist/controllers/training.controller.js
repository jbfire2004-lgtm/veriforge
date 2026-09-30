"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingController = void 0;
const training_service_1 = require("../services/training.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
exports.trainingController = {
    async course(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const course = await training_service_1.trainingService.createCourse({
                companyId,
                name: req.body.name,
                category: req.body.category,
                provider: req.body.provider,
                durationHours: req.body.duration_hours ?? req.body.durationHours,
                expiryDays: req.body.expiry_days ?? req.body.expiryDays,
            });
            return res.status(201).json(course);
        }
        catch (e) {
            next(e);
        }
    },
    async matrix(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const matrix = await training_service_1.trainingService.upsertMatrix({
                companyId,
                role: req.body.role,
                requiredCourses: req.body.required_courses ?? req.body.requiredCourses ?? [],
            });
            return res.status(201).json(matrix);
        }
        catch (e) {
            next(e);
        }
    },
    async assign(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const row = await training_service_1.trainingService.assign({
                companyId,
                workerId: req.body.worker_id ?? req.body.workerId,
                courseId: req.body.course_id ?? req.body.courseId,
            });
            return res.status(201).json(row);
        }
        catch (e) {
            next(e);
        }
    },
    async complete(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const row = await training_service_1.trainingService.complete({
                companyId,
                trainingId: req.body.training_id ?? req.body.trainingId,
                completionDate: req.body.completion_date ?? req.body.completionDate,
                competencyLevel: req.body.competency_level ?? req.body.competencyLevel,
                certificatePath: req.body.certificate_path ?? req.body.certificatePath,
                certificateDataUrl: req.body.certificate_data_url ?? req.body.certificateDataUrl,
                fileName: req.body.file_name ?? req.body.fileName,
            });
            return res.json(row);
        }
        catch (e) {
            next(e);
        }
    },
    async verify(req, res, next) {
        try {
            const companyId = (req.body.company_id ?? req.body.companyId);
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const row = await training_service_1.trainingService.verify({
                companyId,
                trainingId: req.body.training_id ?? req.body.trainingId,
                verifiedBy: req.userId,
                competencyLevel: req.body.competency_level ?? req.body.competencyLevel,
            });
            return res.json(row);
        }
        catch (e) {
            next(e);
        }
    },
    async getWorker(req, res, next) {
        try {
            const workerId = routeParam(req.params.id);
            const companyId = req.query.company_id || req.companyId;
            (0, auth_middleware_1.assertCompanyScope)(req, companyId);
            const summary = await training_service_1.trainingService.getWorkerTraining(workerId, companyId, req.query.role);
            return res.json(summary);
        }
        catch (e) {
            next(e);
        }
    },
};

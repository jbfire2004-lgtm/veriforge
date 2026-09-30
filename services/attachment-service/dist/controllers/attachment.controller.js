"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentController = void 0;
const attachment_service_1 = require("../services/attachment.service");
function routeParam(value) {
    return Array.isArray(value) ? value[0] : value;
}
function resolveCompanyId(req) {
    if (req.downloadToken)
        return req.downloadToken.companyId;
    return req.query.company_id || req.companyId;
}
exports.attachmentController = {
    async upload(req, res, next) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: 'file is required', code: 'VALIDATION_ERROR' });
            }
            const companyId = req.body.company_id;
            attachment_service_1.attachmentService.assertCompanyAccess(req.companyId, companyId);
            const attachment = await attachment_service_1.attachmentService.upload({
                companyId,
                projectId: req.body.project_id,
                moduleType: req.body.module_type,
                moduleRecordId: req.body.module_record_id,
                uploadedBy: req.userId,
                fileName: file.originalname,
                mimeType: file.mimetype,
                buffer: file.buffer,
            });
            return res.status(201).json(attachment);
        }
        catch (e) {
            next(e);
        }
    },
    async getById(req, res, next) {
        try {
            const companyId = resolveCompanyId(req);
            if (!req.downloadToken) {
                attachment_service_1.attachmentService.assertCompanyAccess(req.companyId, companyId);
            }
            const presigned = req.query.presigned;
            const includeUrls = presigned === undefined || presigned === 'true' || presigned === '1';
            const attachment = await attachment_service_1.attachmentService.getMetadata(companyId, routeParam(req.params.id), includeUrls);
            return res.json(attachment);
        }
        catch (e) {
            next(e);
        }
    },
    async download(req, res, next) {
        try {
            const companyId = resolveCompanyId(req);
            const id = routeParam(req.params.id);
            if (req.downloadToken) {
                if (req.downloadToken.attachmentId !== id) {
                    return res.status(403).json({ error: 'Token mismatch', code: 'FORBIDDEN' });
                }
            }
            else {
                attachment_service_1.attachmentService.assertCompanyAccess(req.companyId, companyId);
            }
            const { buffer, contentType, fileName } = await attachment_service_1.attachmentService.getFileStream(companyId, id, 'file');
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Cache-Control', 'private, no-store');
            return res.send(buffer);
        }
        catch (e) {
            next(e);
        }
    },
    async thumbnail(req, res, next) {
        try {
            const companyId = resolveCompanyId(req);
            const id = routeParam(req.params.id);
            if (req.downloadToken) {
                if (req.downloadToken.attachmentId !== id || req.downloadToken.kind !== 'thumbnail') {
                    return res.status(403).json({ error: 'Token mismatch', code: 'FORBIDDEN' });
                }
            }
            else {
                attachment_service_1.attachmentService.assertCompanyAccess(req.companyId, companyId);
            }
            const { buffer, contentType } = await attachment_service_1.attachmentService.getFileStream(companyId, id, 'thumbnail');
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'private, no-store');
            return res.send(buffer);
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=attachment.controller.js.map
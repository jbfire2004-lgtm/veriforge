"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentRouter = void 0;
const express_1 = require("express");
const attachment_controller_1 = require("../controllers/attachment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const error_handler_1 = require("../middleware/error-handler");
const attachment_validators_1 = require("../validators/attachment.validators");
exports.attachmentRouter = (0, express_1.Router)();
exports.attachmentRouter.post('/upload', auth_middleware_1.requireAuth, upload_middleware_1.uploadMiddleware.single('file'), attachment_validators_1.uploadValidators, error_handler_1.handleValidation, attachment_controller_1.attachmentController.upload);
exports.attachmentRouter.get('/:id/thumbnail', (0, auth_middleware_1.requireAuthOrDownloadToken)('thumbnail'), attachment_validators_1.streamValidators, error_handler_1.handleValidation, attachment_controller_1.attachmentController.thumbnail);
exports.attachmentRouter.get('/:id/download', (0, auth_middleware_1.requireAuthOrDownloadToken)('file'), attachment_validators_1.streamValidators, error_handler_1.handleValidation, attachment_controller_1.attachmentController.download);
exports.attachmentRouter.get('/:id', auth_middleware_1.requireAuth, attachment_validators_1.getAttachmentValidators, error_handler_1.handleValidation, attachment_controller_1.attachmentController.getById);
//# sourceMappingURL=attachment.routes.js.map
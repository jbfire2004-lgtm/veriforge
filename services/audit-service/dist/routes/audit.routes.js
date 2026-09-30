"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRouter = void 0;
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_handler_1 = require("../middleware/error-handler");
const audit_validators_1 = require("../validators/audit.validators");
exports.auditRouter = (0, express_1.Router)();
exports.auditRouter.post('/event', auth_middleware_1.requireAuthOrServiceKey, audit_validators_1.ingestEventValidators, error_handler_1.handleValidation, audit_controller_1.auditController.ingestEvent);
exports.auditRouter.use(auth_middleware_1.requireAuth);
exports.auditRouter.get('/events', audit_validators_1.listEventsValidators, error_handler_1.handleValidation, audit_controller_1.auditController.listEvents);
exports.auditRouter.get('/event/:id', audit_validators_1.getEventValidators, error_handler_1.handleValidation, audit_controller_1.auditController.getEvent);
//# sourceMappingURL=audit.routes.js.map
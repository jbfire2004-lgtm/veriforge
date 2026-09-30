"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const request_logger_1 = require("./middleware/request-logger");
const error_handler_1 = require("./middleware/error-handler");
const work_package_routes_1 = require("./routes/work-package.routes");
const health_routes_1 = require("./routes/health.routes");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.corsOrigin === '*' ? true : env_1.env.corsOrigin.split(','),
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: '5mb' }));
    app.use(request_logger_1.requestLogger);
    app.use('/health', health_routes_1.healthRouter);
    app.use('/pm/work-package', work_package_routes_1.workPackageRouter);
    app.use(error_handler_1.errorHandler);
    return app;
}

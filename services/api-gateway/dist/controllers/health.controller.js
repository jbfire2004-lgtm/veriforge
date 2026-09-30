"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = void 0;
const env_1 = require("../config/env");
async function probeReady(baseUrl) {
    try {
        const res = await fetch(`${baseUrl.replace(/\/$/, '')}/health/ready`, {
            signal: AbortSignal.timeout(env_1.env.healthCheckTimeoutMs),
        });
        return res.ok ? 'up' : 'down';
    }
    catch {
        return 'down';
    }
}
exports.healthController = {
    live(_req, res) {
        return res.json({ status: 'live', service: 'api-gateway' });
    },
    async ready(_req, res) {
        const [auth, rbac, audit, attachment, offline, hazardControl, backend] = await Promise.all([
            probeReady(env_1.env.authServiceUrl),
            probeReady(env_1.env.rbacServiceUrl),
            probeReady(env_1.env.auditServiceUrl),
            probeReady(env_1.env.attachmentServiceUrl),
            probeReady(env_1.env.offlineServiceUrl),
            probeReady(env_1.env.hazardControlServiceUrl),
            probeReady(env_1.env.backendServiceUrl),
        ]);
        const dependencies = {
            auth,
            rbac,
            audit,
            attachment,
            offline,
            hazardControl,
            backend,
        };
        const allUp = Object.values(dependencies).every((s) => s === 'up');
        return res.status(allUp ? 200 : 503).json({
            status: allUp ? 'ready' : 'degraded',
            service: 'api-gateway',
            dependencies,
        });
    },
};
//# sourceMappingURL=health.controller.js.map
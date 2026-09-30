"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = void 0;
const prisma_1 = require("../db/prisma");
exports.healthController = {
    live(_req, res) {
        return res.json({ status: 'live', service: 'attachment-service' });
    },
    async ready(_req, res) {
        try {
            await prisma_1.prisma.$queryRaw `SELECT 1`;
            return res.json({ status: 'ready', service: 'attachment-service' });
        }
        catch {
            return res.status(503).json({ status: 'not_ready', service: 'attachment-service' });
        }
    },
};
//# sourceMappingURL=health.controller.js.map
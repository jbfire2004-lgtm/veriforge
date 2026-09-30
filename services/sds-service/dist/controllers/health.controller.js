"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = void 0;
const prisma_1 = require("../db/prisma");
exports.healthController = {
    live(_req, res) {
        return res.json({ status: 'live', service: 'sds-service' });
    },
    async ready(_req, res) {
        try {
            await prisma_1.prisma.$queryRaw `SELECT 1`;
            return res.json({ status: 'ready', service: 'sds-service' });
        }
        catch {
            return res.status(503).json({ status: 'not_ready', service: 'sds-service' });
        }
    },
};

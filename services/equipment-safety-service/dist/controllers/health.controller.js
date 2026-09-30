"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = void 0;
const prisma_1 = require("../db/prisma");
exports.healthController = {
    live(_req, res) {
        return res.json({ status: 'live', service: 'equipment-safety-service' });
    },
    async ready(_req, res) {
        try {
            await prisma_1.prisma.$queryRaw `SELECT 1`;
            return res.json({ status: 'ready', service: 'equipment-safety-service' });
        }
        catch {
            return res.status(503).json({ status: 'not_ready', service: 'equipment-safety-service' });
        }
    },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = void 0;
const prisma_1 = require("../db/prisma");
const model_cache_1 = require("../engines/model-cache");
exports.healthController = {
    live(_req, res) {
        return res.json({ status: 'ok' });
    },
    async ready(_req, res) {
        try {
            await prisma_1.prisma.$queryRaw `SELECT 1`;
            model_cache_1.modelCache.load();
            return res.json({ status: 'ready', database: 'connected', modelCacheSize: model_cache_1.modelCache.size() });
        }
        catch {
            return res.status(503).json({ status: 'not_ready', database: 'disconnected' });
        }
    },
};

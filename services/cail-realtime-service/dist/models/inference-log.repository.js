"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferenceLogRepository = void 0;
const prisma_1 = require("../db/prisma");
function json(value) {
    return value;
}
exports.inferenceLogRepository = {
    create(data) {
        return prisma_1.prisma.cailInferenceLog.create({
            data: {
                companyId: data.companyId,
                modelId: data.modelId,
                version: data.version,
                engineLayer: data.engineLayer,
                inputData: json(data.inputData),
                outputData: json(data.outputData),
                latencyMs: data.latencyMs,
            },
        });
    },
};

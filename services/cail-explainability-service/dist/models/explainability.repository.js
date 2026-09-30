"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainabilityRepository = void 0;
const prisma_1 = require("../db/prisma");
function json(value) {
    return value;
}
exports.explainabilityRepository = {
    create(data) {
        return prisma_1.prisma.cailExplainability.create({
            data: {
                companyId: data.companyId,
                predictionId: data.predictionId,
                explanationText: data.explanationText,
                contributingData: json(data.contributingData),
            },
        });
    },
    findById(id, companyId) {
        return prisma_1.prisma.cailExplainability.findFirst({ where: { id, companyId } });
    },
    findLatestByPredictionId(predictionId, companyId) {
        return prisma_1.prisma.cailExplainability.findFirst({
            where: { predictionId, companyId },
            orderBy: { createdAt: 'desc' },
        });
    },
};

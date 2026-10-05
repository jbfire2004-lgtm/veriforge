"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationJhaEngine = void 0;
class StationJhaEngine {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async validateForStation(input) {
        var _a, _b, _c;
        const denialReasons = [];
        const checks = {};
        const requiredPpe = [];
        const hours = input.flhaHours || 24;
        const flhaSince = new Date(Date.now() - hours * 60 * 60 * 1000);
        const flha = await this.prisma.jhaFlha.findFirst({
            where: {
                projectId: input.projectId,
                kind: 'FLHA',
                status: { in: ['APPROVED', 'LOCKED', 'SUBMITTED', 'UNDER_REVIEW'] },
                workers: { some: { workerId: input.workerId } },
                OR: [
                    { approvedAt: { gte: flhaSince } },
                    { submittedAt: { gte: flhaSince } },
                ],
            },
            include: { controls: true },
        });
        checks.flha = !!flha;
        if (!checks.flha) {
            denialReasons.push(`FLHA not completed within last ${hours} hours`);
        }
        let jhaFlhaId = flha === null || flha === void 0 ? void 0 : flha.id;
        if (input.requiresJha) {
            const jha = await this.prisma.jhaFlha.findFirst({
                where: Object.assign({ projectId: input.projectId, kind: 'JHA', status: { in: ['APPROVED', 'LOCKED'] }, workers: { some: { workerId: input.workerId } } }, (input.equipmentId
                    ? {
                        equipmentLinks: {
                            some: { equipmentId: input.equipmentId, authorized: true },
                        },
                    }
                    : {})),
                include: { signatures: true, controls: true, workers: true },
                orderBy: { approvedAt: 'desc' },
            });
            checks.jha = !!jha;
            if (!jha) {
                denialReasons.push('Approved JHA required');
            }
            else {
                jhaFlhaId = jha.id;
                const workerSig = jha.workers.some((w) => w.workerId === input.workerId && w.signedAt) || jha.signatures.some((s) => s.role === 'WORKER');
                checks.workerSignedJha = workerSig;
                if (!workerSig)
                    denialReasons.push('Worker JHA signature missing');
                const supervisorSig = jha.signatures.some((s) => s.role === 'SUPERVISOR');
                checks.supervisorApproved = supervisorSig;
                if (!supervisorSig)
                    denialReasons.push('Supervisor JHA approval missing');
                const controlsInPlace = ((_b = (_a = jha.controls) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0;
                checks.controlsInPlace = controlsInPlace;
                if (!controlsInPlace)
                    denialReasons.push('JHA controls not documented');
                for (const c of (_c = jha.controls) !== null && _c !== void 0 ? _c : []) {
                    if (c.ppeRequired)
                        requiredPpe.push(c.controlType || 'ppe');
                }
                checks.requiredPpe = requiredPpe.length === 0 || requiredPpe.length > 0;
            }
        }
        return {
            valid: denialReasons.length === 0,
            jhaFlhaId,
            denialReasons,
            checks,
            requiredPpe: [...new Set(requiredPpe)],
        };
    }
    async syncPayload(projectId) {
        const jhas = await this.prisma.jhaFlha.findMany({
            where: {
                projectId,
                status: { in: ['APPROVED', 'LOCKED', 'SUBMITTED'] },
            },
            select: {
                id: true,
                kind: true,
                status: true,
                taskDescription: true,
                approvedAt: true,
                workers: { select: { workerId: true } },
                signatures: {
                    select: { signerUserId: true, role: true, signedAt: true },
                },
            },
            take: 200,
        });
        const rules = await this.prisma.siteAccessRule.findMany({
            where: { projectId },
            select: { zoneCode: true, requiresJha: true, requiresFlhaHours: true },
        });
        return { activeJhas: jhas, zoneJhaRules: rules };
    }
}
exports.StationJhaEngine = StationJhaEngine;
//# sourceMappingURL=station-jha.engine.js.map
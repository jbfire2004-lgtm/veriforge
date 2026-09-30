"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnionDispatchReportSchema = exports.CompanyReadinessReportSchema = exports.ProjectReadinessReportSchema = exports.WorkerComplianceReportSchema = exports.ReportingOverviewSchema = exports.ReportingChartSchema = void 0;
const zod_1 = require("zod");
exports.ReportingChartSchema = zod_1.z.object({
    labels: zod_1.z.array(zod_1.z.string()),
    values: zod_1.z.array(zod_1.z.number()),
});
exports.ReportingOverviewSchema = zod_1.z.object({
    companyId: zod_1.z.number().nullable(),
    workers: zod_1.z.unknown(),
    equipment: zod_1.z.unknown(),
    competency: zod_1.z.unknown(),
    inspections: zod_1.z.unknown(),
    projects: zod_1.z.unknown(),
    companies: zod_1.z.unknown(),
    unionDispatch: zod_1.z.unknown(),
    generatedAt: zod_1.z.string(),
});
exports.WorkerComplianceReportSchema = zod_1.z.object({
    summary: zod_1.z.object({
        totalWorkers: zod_1.z.number(),
        evaluated: zod_1.z.number(),
        compliant: zod_1.z.number(),
        nonCompliant: zod_1.z.number(),
        expiringSoon: zod_1.z.number(),
        complianceRate: zod_1.z.number(),
    }),
    chart: exports.ReportingChartSchema,
    rows: zod_1.z.array(zod_1.z.object({
        workerId: zod_1.z.number(),
        workerName: zod_1.z.string(),
        companyId: zod_1.z.number().nullable(),
        companyName: zod_1.z.string().nullable(),
        isCompliant: zod_1.z.boolean(),
        issueCount: zod_1.z.number(),
        expiringSoon: zod_1.z.boolean(),
    })),
});
exports.ProjectReadinessReportSchema = zod_1.z.object({
    summary: zod_1.z.object({
        totalProjects: zod_1.z.number(),
        ready: zod_1.z.number(),
        atRisk: zod_1.z.number(),
        notReady: zod_1.z.number(),
        averageReadiness: zod_1.z.number(),
    }),
    chart: exports.ReportingChartSchema,
    rows: zod_1.z.array(zod_1.z.object({
        projectId: zod_1.z.number(),
        projectName: zod_1.z.string(),
        projectCode: zod_1.z.string().nullable(),
        companyId: zod_1.z.number(),
        companyName: zod_1.z.string(),
        totalWorkers: zod_1.z.number(),
        compliantWorkers: zod_1.z.number(),
        totalEquipment: zod_1.z.number(),
        compliantEquipment: zod_1.z.number(),
        readinessScore: zod_1.z.number(),
        readinessStatus: zod_1.z.enum(['READY', 'AT_RISK', 'NOT_READY']),
    })),
});
exports.CompanyReadinessReportSchema = zod_1.z.object({
    company: zod_1.z.object({ id: zod_1.z.number(), name: zod_1.z.string() }),
    overallScore: zod_1.z.number(),
    readinessStatus: zod_1.z.enum(['READY', 'AT_RISK', 'NOT_READY']),
    workers: zod_1.z.unknown(),
    equipment: zod_1.z.unknown(),
    inspections: zod_1.z.unknown(),
    projects: zod_1.z.unknown(),
});
exports.UnionDispatchReportSchema = zod_1.z.object({
    summary: zod_1.z.object({
        totalDispatches: zod_1.z.number(),
        activeDispatches: zod_1.z.number(),
        recalledDispatches: zod_1.z.number(),
        activeMembers: zod_1.z.number(),
    }),
    chart: exports.ReportingChartSchema,
    byCompany: zod_1.z.array(zod_1.z.object({
        companyId: zod_1.z.number(),
        companyName: zod_1.z.string(),
        count: zod_1.z.number(),
    })),
    byHall: zod_1.z.array(zod_1.z.object({
        unionHallId: zod_1.z.number(),
        unionHallName: zod_1.z.string(),
        count: zod_1.z.number(),
    })),
    recent: zod_1.z.array(zod_1.z.unknown()),
});

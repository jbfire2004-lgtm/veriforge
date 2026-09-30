import { z } from 'zod';

export const ReportingChartSchema = z.object({
  labels: z.array(z.string()),
  values: z.array(z.number()),
});

export const ReportingOverviewSchema = z.object({
  companyId: z.number().nullable(),
  workers: z.unknown(),
  equipment: z.unknown(),
  competency: z.unknown(),
  inspections: z.unknown(),
  projects: z.unknown(),
  companies: z.unknown(),
  unionDispatch: z.unknown(),
  generatedAt: z.string(),
});

export const WorkerComplianceReportSchema = z.object({
  summary: z.object({
    totalWorkers: z.number(),
    evaluated: z.number(),
    compliant: z.number(),
    nonCompliant: z.number(),
    expiringSoon: z.number(),
    complianceRate: z.number(),
  }),
  chart: ReportingChartSchema,
  rows: z.array(
    z.object({
      workerId: z.number(),
      workerName: z.string(),
      companyId: z.number().nullable(),
      companyName: z.string().nullable(),
      isCompliant: z.boolean(),
      issueCount: z.number(),
      expiringSoon: z.boolean(),
    }),
  ),
});

export const ProjectReadinessReportSchema = z.object({
  summary: z.object({
    totalProjects: z.number(),
    ready: z.number(),
    atRisk: z.number(),
    notReady: z.number(),
    averageReadiness: z.number(),
  }),
  chart: ReportingChartSchema,
  rows: z.array(
    z.object({
      projectId: z.number(),
      projectName: z.string(),
      projectCode: z.string().nullable(),
      companyId: z.number(),
      companyName: z.string(),
      totalWorkers: z.number(),
      compliantWorkers: z.number(),
      totalEquipment: z.number(),
      compliantEquipment: z.number(),
      readinessScore: z.number(),
      readinessStatus: z.enum(['READY', 'AT_RISK', 'NOT_READY']),
    }),
  ),
});

export const CompanyReadinessReportSchema = z.object({
  company: z.object({ id: z.number(), name: z.string() }),
  overallScore: z.number(),
  readinessStatus: z.enum(['READY', 'AT_RISK', 'NOT_READY']),
  workers: z.unknown(),
  equipment: z.unknown(),
  inspections: z.unknown(),
  projects: z.unknown(),
});

export const UnionDispatchReportSchema = z.object({
  summary: z.object({
    totalDispatches: z.number(),
    activeDispatches: z.number(),
    recalledDispatches: z.number(),
    activeMembers: z.number(),
  }),
  chart: ReportingChartSchema,
  byCompany: z.array(
    z.object({
      companyId: z.number(),
      companyName: z.string(),
      count: z.number(),
    }),
  ),
  byHall: z.array(
    z.object({
      unionHallId: z.number(),
      unionHallName: z.string(),
      count: z.number(),
    }),
  ),
  recent: z.array(z.unknown()),
});

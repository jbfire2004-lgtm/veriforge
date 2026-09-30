import { z } from 'zod';
export declare const ReportingChartSchema: z.ZodObject<{
    labels: z.ZodArray<z.ZodString, "many">;
    values: z.ZodArray<z.ZodNumber, "many">;
}, "strip", z.ZodTypeAny, {
    values: number[];
    labels: string[];
}, {
    values: number[];
    labels: string[];
}>;
export declare const ReportingOverviewSchema: z.ZodObject<{
    companyId: z.ZodNullable<z.ZodNumber>;
    workers: z.ZodUnknown;
    equipment: z.ZodUnknown;
    competency: z.ZodUnknown;
    inspections: z.ZodUnknown;
    projects: z.ZodUnknown;
    companies: z.ZodUnknown;
    unionDispatch: z.ZodUnknown;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    companyId: number | null;
    generatedAt: string;
    equipment?: unknown;
    inspections?: unknown;
    competency?: unknown;
    workers?: unknown;
    projects?: unknown;
    companies?: unknown;
    unionDispatch?: unknown;
}, {
    companyId: number | null;
    generatedAt: string;
    equipment?: unknown;
    inspections?: unknown;
    competency?: unknown;
    workers?: unknown;
    projects?: unknown;
    companies?: unknown;
    unionDispatch?: unknown;
}>;
export declare const WorkerComplianceReportSchema: z.ZodObject<{
    summary: z.ZodObject<{
        totalWorkers: z.ZodNumber;
        evaluated: z.ZodNumber;
        compliant: z.ZodNumber;
        nonCompliant: z.ZodNumber;
        expiringSoon: z.ZodNumber;
        complianceRate: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        expiringSoon: number;
        nonCompliant: number;
        compliant: number;
        totalWorkers: number;
        evaluated: number;
        complianceRate: number;
    }, {
        expiringSoon: number;
        nonCompliant: number;
        compliant: number;
        totalWorkers: number;
        evaluated: number;
        complianceRate: number;
    }>;
    chart: z.ZodObject<{
        labels: z.ZodArray<z.ZodString, "many">;
        values: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        values: number[];
        labels: string[];
    }, {
        values: number[];
        labels: string[];
    }>;
    rows: z.ZodArray<z.ZodObject<{
        workerId: z.ZodNumber;
        workerName: z.ZodString;
        companyId: z.ZodNullable<z.ZodNumber>;
        companyName: z.ZodNullable<z.ZodString>;
        isCompliant: z.ZodBoolean;
        issueCount: z.ZodNumber;
        expiringSoon: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        companyId: number | null;
        workerId: number;
        expiringSoon: boolean;
        workerName: string;
        companyName: string | null;
        isCompliant: boolean;
        issueCount: number;
    }, {
        companyId: number | null;
        workerId: number;
        expiringSoon: boolean;
        workerName: string;
        companyName: string | null;
        isCompliant: boolean;
        issueCount: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    summary: {
        expiringSoon: number;
        nonCompliant: number;
        compliant: number;
        totalWorkers: number;
        evaluated: number;
        complianceRate: number;
    };
    chart: {
        values: number[];
        labels: string[];
    };
    rows: {
        companyId: number | null;
        workerId: number;
        expiringSoon: boolean;
        workerName: string;
        companyName: string | null;
        isCompliant: boolean;
        issueCount: number;
    }[];
}, {
    summary: {
        expiringSoon: number;
        nonCompliant: number;
        compliant: number;
        totalWorkers: number;
        evaluated: number;
        complianceRate: number;
    };
    chart: {
        values: number[];
        labels: string[];
    };
    rows: {
        companyId: number | null;
        workerId: number;
        expiringSoon: boolean;
        workerName: string;
        companyName: string | null;
        isCompliant: boolean;
        issueCount: number;
    }[];
}>;
export declare const ProjectReadinessReportSchema: z.ZodObject<{
    summary: z.ZodObject<{
        totalProjects: z.ZodNumber;
        ready: z.ZodNumber;
        atRisk: z.ZodNumber;
        notReady: z.ZodNumber;
        averageReadiness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalProjects: number;
        ready: number;
        atRisk: number;
        notReady: number;
        averageReadiness: number;
    }, {
        totalProjects: number;
        ready: number;
        atRisk: number;
        notReady: number;
        averageReadiness: number;
    }>;
    chart: z.ZodObject<{
        labels: z.ZodArray<z.ZodString, "many">;
        values: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        values: number[];
        labels: string[];
    }, {
        values: number[];
        labels: string[];
    }>;
    rows: z.ZodArray<z.ZodObject<{
        projectId: z.ZodNumber;
        projectName: z.ZodString;
        projectCode: z.ZodNullable<z.ZodString>;
        companyId: z.ZodNumber;
        companyName: z.ZodString;
        totalWorkers: z.ZodNumber;
        compliantWorkers: z.ZodNumber;
        totalEquipment: z.ZodNumber;
        compliantEquipment: z.ZodNumber;
        readinessScore: z.ZodNumber;
        readinessStatus: z.ZodEnum<["READY", "AT_RISK", "NOT_READY"]>;
    }, "strip", z.ZodTypeAny, {
        companyId: number;
        projectId: number;
        totalWorkers: number;
        companyName: string;
        projectName: string;
        projectCode: string | null;
        compliantWorkers: number;
        totalEquipment: number;
        compliantEquipment: number;
        readinessScore: number;
        readinessStatus: "READY" | "AT_RISK" | "NOT_READY";
    }, {
        companyId: number;
        projectId: number;
        totalWorkers: number;
        companyName: string;
        projectName: string;
        projectCode: string | null;
        compliantWorkers: number;
        totalEquipment: number;
        compliantEquipment: number;
        readinessScore: number;
        readinessStatus: "READY" | "AT_RISK" | "NOT_READY";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    summary: {
        totalProjects: number;
        ready: number;
        atRisk: number;
        notReady: number;
        averageReadiness: number;
    };
    chart: {
        values: number[];
        labels: string[];
    };
    rows: {
        companyId: number;
        projectId: number;
        totalWorkers: number;
        companyName: string;
        projectName: string;
        projectCode: string | null;
        compliantWorkers: number;
        totalEquipment: number;
        compliantEquipment: number;
        readinessScore: number;
        readinessStatus: "READY" | "AT_RISK" | "NOT_READY";
    }[];
}, {
    summary: {
        totalProjects: number;
        ready: number;
        atRisk: number;
        notReady: number;
        averageReadiness: number;
    };
    chart: {
        values: number[];
        labels: string[];
    };
    rows: {
        companyId: number;
        projectId: number;
        totalWorkers: number;
        companyName: string;
        projectName: string;
        projectCode: string | null;
        compliantWorkers: number;
        totalEquipment: number;
        compliantEquipment: number;
        readinessScore: number;
        readinessStatus: "READY" | "AT_RISK" | "NOT_READY";
    }[];
}>;
export declare const CompanyReadinessReportSchema: z.ZodObject<{
    company: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
    }, {
        id: number;
        name: string;
    }>;
    overallScore: z.ZodNumber;
    readinessStatus: z.ZodEnum<["READY", "AT_RISK", "NOT_READY"]>;
    workers: z.ZodUnknown;
    equipment: z.ZodUnknown;
    inspections: z.ZodUnknown;
    projects: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    company: {
        id: number;
        name: string;
    };
    readinessStatus: "READY" | "AT_RISK" | "NOT_READY";
    overallScore: number;
    equipment?: unknown;
    inspections?: unknown;
    workers?: unknown;
    projects?: unknown;
}, {
    company: {
        id: number;
        name: string;
    };
    readinessStatus: "READY" | "AT_RISK" | "NOT_READY";
    overallScore: number;
    equipment?: unknown;
    inspections?: unknown;
    workers?: unknown;
    projects?: unknown;
}>;
export declare const UnionDispatchReportSchema: z.ZodObject<{
    summary: z.ZodObject<{
        totalDispatches: z.ZodNumber;
        activeDispatches: z.ZodNumber;
        recalledDispatches: z.ZodNumber;
        activeMembers: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalDispatches: number;
        activeDispatches: number;
        recalledDispatches: number;
        activeMembers: number;
    }, {
        totalDispatches: number;
        activeDispatches: number;
        recalledDispatches: number;
        activeMembers: number;
    }>;
    chart: z.ZodObject<{
        labels: z.ZodArray<z.ZodString, "many">;
        values: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        values: number[];
        labels: string[];
    }, {
        values: number[];
        labels: string[];
    }>;
    byCompany: z.ZodArray<z.ZodObject<{
        companyId: z.ZodNumber;
        companyName: z.ZodString;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        companyId: number;
        count: number;
        companyName: string;
    }, {
        companyId: number;
        count: number;
        companyName: string;
    }>, "many">;
    byHall: z.ZodArray<z.ZodObject<{
        unionHallId: z.ZodNumber;
        unionHallName: z.ZodString;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        count: number;
        unionHallId: number;
        unionHallName: string;
    }, {
        count: number;
        unionHallId: number;
        unionHallName: string;
    }>, "many">;
    recent: z.ZodArray<z.ZodUnknown, "many">;
}, "strip", z.ZodTypeAny, {
    recent: unknown[];
    summary: {
        totalDispatches: number;
        activeDispatches: number;
        recalledDispatches: number;
        activeMembers: number;
    };
    chart: {
        values: number[];
        labels: string[];
    };
    byCompany: {
        companyId: number;
        count: number;
        companyName: string;
    }[];
    byHall: {
        count: number;
        unionHallId: number;
        unionHallName: string;
    }[];
}, {
    recent: unknown[];
    summary: {
        totalDispatches: number;
        activeDispatches: number;
        recalledDispatches: number;
        activeMembers: number;
    };
    chart: {
        values: number[];
        labels: string[];
    };
    byCompany: {
        companyId: number;
        count: number;
        companyName: string;
    }[];
    byHall: {
        count: number;
        unionHallId: number;
        unionHallName: string;
    }[];
}>;

import { UserRole } from '@prisma/client';
import { VsiDashboardsService } from './dashboards.service';
import { CailScopeService } from '../cail/cail-scope.service';
import { PredictiveRiskService } from '../predictive/predictive-risk.service';
export declare class VsiDashboardsController {
    private readonly dashboards;
    private readonly scope;
    private readonly predictive;
    constructor(dashboards: VsiDashboardsService, scope: CailScopeService, predictive: PredictiveRiskService);
    revision(projectId: string): {
        projectId: number;
        revision: number;
    };
    project(projectId: string, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
        dashboardRevision: number;
        projectId: number;
        total: number;
        open: number;
        resolved: number;
        verified: number;
        overdue: number;
        closureRate: number;
        byStatus: {
            [k: string]: number;
        };
        bySeverity: {
            [k: string]: number;
        };
        bySource: {
            [k: string]: number;
        };
        recent: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.CailStatus;
            title: string;
            severity: import(".prisma/client").$Enums.CailSeverity;
            sourceType: import(".prisma/client").$Enums.CailSourceType;
            dueDate: Date;
        }[];
        lessonsRecent: {
            id: string;
            title: string;
            publishedAt: Date;
            sourceType: import(".prisma/client").$Enums.CailSourceType;
        }[];
        bbo: {
            total: number;
            safe: number;
            positiveRatio: number;
        };
        meanTimeToResolveHours: number;
        predictiveRisk: import("../predictive/predictive-risk.service").PredictiveRiskReport;
    }>;
    company(req: {
        user: {
            id: number;
            role: UserRole;
        };
    }, ownerCompanyId?: string): Promise<{
        ownerCompanyId: number;
        total: number;
        overdue: number;
        byProject: {
            projectId: number;
            count: number;
        }[];
    } | {
        total: number;
        overdue: number;
        byProject: any[];
    }>;
    predictiveRisk(projectId: string): Promise<import("../predictive/predictive-risk.service").PredictiveRiskReport | {
        projectId: number;
        message: string;
    }>;
    computePredictiveRisk(projectId: string): Promise<import("../predictive/predictive-risk.service").PredictiveRiskReport>;
}

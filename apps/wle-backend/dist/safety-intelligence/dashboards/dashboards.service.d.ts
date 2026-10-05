import { PrismaService } from '../../prisma/prisma.service';
import { CailScopeService, type CailActor } from '../cail/cail-scope.service';
import { PredictiveRiskService } from '../predictive/predictive-risk.service';
import { VsiDashboardRevisionService } from '../events/vsi-dashboard-revision.service';
export declare class VsiDashboardsService {
    private readonly prisma;
    private readonly scope;
    private readonly predictive;
    private readonly revisions;
    private readonly cache;
    constructor(prisma: PrismaService, scope: CailScopeService, predictive: PredictiveRiskService, revisions: VsiDashboardRevisionService);
    getRevision(projectId: number): {
        projectId: number;
        revision: number;
    };
    projectDashboard(projectId: number, actor: CailActor): Promise<{
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
    private computeProjectDashboard;
    companyDashboard(ownerCompanyId: number, actor: CailActor): Promise<{
        ownerCompanyId: number;
        total: number;
        overdue: number;
        byProject: {
            projectId: number;
            count: number;
        }[];
    }>;
}

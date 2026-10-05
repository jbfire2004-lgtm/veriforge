import { PrismaService } from '../prisma/prisma.service';
import { SifHecaService } from '../sif-heca/sif-heca.service';
import { EventClassificationEngine } from './event-classification.engine';
import { SeverityRiskEngine } from './severity-risk.engine';
import { RcaEngine } from './rca.engine';
export declare class PmSafetyEventsIntelligenceService {
    private readonly prisma;
    private readonly classifier;
    private readonly riskEngine;
    private readonly rca;
    private readonly sifHeca?;
    constructor(prisma: PrismaService, classifier: EventClassificationEngine, riskEngine: SeverityRiskEngine, rca: RcaEngine, sifHeca?: SifHecaService);
    getEventScore(eventId: string): Promise<{
        source: string;
        sifEventId: string;
        sif_score: number;
        sif_category: import(".prisma/client").$Enums.SifPotentialCategory;
        heca_category: string;
        heca_category_label: string;
        risk_score: number;
        requires_supervisor_review: boolean;
    } | {
        risk_score: number;
        sif_score: number;
        sif_category: "medium" | "low" | "high" | "critical";
        heca_category: string;
        heca_category_label: string;
        heca_risk_score: number;
        high_energy_flag: boolean;
        requires_supervisor_review: boolean;
        required_controls: string[];
        required_corrective_actions: string[];
        explainability: {
            sif: {
                rule: string;
                points: number;
                detail: string;
            }[];
            heca: {
                rule: string;
                detail: string;
            }[];
            csra: {
                rule: string;
                detail: string;
            }[];
        };
        control_findings: string[];
        csra: import("../sif-heca/csra-heca.engine").CsraAssessmentOutput;
        source: string;
        sifEventId: any;
    } | {
        source: string;
        sif_score: any;
        heca_category: string;
        risk_score: number;
        requires_supervisor_review: boolean;
        sifEventId?: undefined;
        sif_category?: undefined;
        heca_category_label?: undefined;
    }>;
    predictFromEvent(eventId: string): Promise<{
        sif_score: any;
        heca_category: string;
        root_cause_suggestions: any[];
        recommended_corrective_actions: {
            title: string;
            priority: string;
        }[];
        predictive_recurrence_likelihood: number;
        worker_risk_impacts: {
            workerId: number;
            eventsInvolved: number;
            injuryRecords: number;
            riskScore: number;
        }[];
        equipment_risk_impact: {
            equipmentInvolved: number;
            lockoutsApplied: number;
        };
        requires_safety_review: boolean;
        explainability: {
            rule: string;
            detail: string;
        }[];
    }>;
    projectAnalytics(projectId: number): Promise<{
        totalEvents: number;
        byType: Record<string, number>;
        bySeverity: Record<string, number>;
        rootCauseDistribution: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PmSafetyEventRootCauseGroupByOutputType, "category"[]> & {
            _count: number;
        })[];
        nearMissTrend: number;
        injuryCount: number;
        projectIncidentScore: number;
        complianceLeadingIndicator: number;
        trends: {
            events90d: number;
            injuryRate90d: number;
        };
        workerInvolvementByRole: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PmSafetyEventPersonGroupByOutputType, "role"[]> & {
            _count: number;
        })[];
        equipmentInvolvementCount: number;
        sifHecaLinkedCount: number;
        hecaCategoryTrend: Record<string, number>;
        explainability: {
            rule: string;
            detail: string;
        }[];
    }>;
    workerRiskProfile(workerId: number, projectId: number): Promise<{
        workerId: number;
        eventsInvolved: number;
        injuryRecords: number;
        riskScore: number;
    }>;
}

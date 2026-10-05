import { PrismaService } from '../prisma/prisma.service';
import { DeficiencyScoringEngine } from './deficiency-scoring.engine';
import type { AuditInspectionCapaEngineInput, AuditInspectionCapaEngineOutput } from './audit-inspection-capa-engine.types';
export declare class AuditInspectionCapaEngineService {
    private readonly prisma;
    private readonly deficiencyScoring;
    constructor(prisma: PrismaService, deficiencyScoring: DeficiencyScoringEngine);
    generate(input: AuditInspectionCapaEngineInput): AuditInspectionCapaEngineOutput;
    buildInputFromInspection(inspectionId: string): Promise<AuditInspectionCapaEngineInput>;
    private normalizeItems;
    private buildFindings;
    private buildCapa;
    private analyzeTrends;
    private buildExecutiveSummary;
    private buildFieldBrief;
    private isNonCompliant;
    private answerToStatus;
    private failedItemIdsFromAnswers;
    private matchStandard;
    private likelihoodFor;
    private consequenceFor;
    private riskLevel;
    private isSifRelevant;
    private systemicCategories;
    private ownerFor;
}

import type { ProjectComplianceRuleType } from '@prisma/client';
import { type ComplianceCredentialStatus, type ComplianceRuleGap, type RuleMetadata, type WorkerComplianceEvaluation } from './project-compliance.types';
export type EvaluatorRule = {
    id: number;
    ruleType: ProjectComplianceRuleType;
    requiredCredentialTypeId: number;
    certificationCode: string | null;
    certificationName: string;
    metadata: RuleMetadata;
};
export type EvaluatorCredential = {
    id: number;
    certificationId: number;
    expiresAt: Date | null;
    lastVerificationStatus: string | null;
};
export type EvaluatorWorker = {
    id: number;
    firstName: string;
    lastName: string;
    role: string | null;
    trade: string | null;
};
export declare function ruleAppliesToWorker(rule: EvaluatorRule, worker: Pick<EvaluatorWorker, 'role' | 'trade'>): boolean;
export declare function credentialStatus(record: EvaluatorCredential | undefined, now: Date, expiringCutoff: Date): ComplianceCredentialStatus;
export declare function evaluateWorkerCompliance(worker: EvaluatorWorker, rules: EvaluatorRule[], credentials: EvaluatorCredential[], now?: Date): WorkerComplianceEvaluation;
export declare function aggregateProjectCompliance(projectId: number, projectName: string, companyId: number, client: string | null, workers: WorkerComplianceEvaluation[]): {
    compliancePercentage: number;
    compliantWorkers: WorkerComplianceEvaluation[];
    nonCompliantWorkers: WorkerComplianceEvaluation[];
    missingOrExpiring: ComplianceRuleGap[];
};

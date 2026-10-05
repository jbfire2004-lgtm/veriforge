import { PrismaService } from '../../prisma/prisma.service';
import { CompanyLinksService } from '../vera-core/company-links.service';
import { ProjectsService } from '../vera-core/projects.service';
import { EquipmentLinksService } from '../vera-core/equipment-links.service';
import { TrainingRecordsService } from '../../training-records/training-records.service';
import { PmSafetyWorkflowService } from '../../pm-safety-workflow/pm-safety-workflow.service';
import { SafetyFormSubmissionsService } from '../../forms/submissions/submissions.service';
import { TrainingWalletIntegrationService } from '../vera-core/training-wallet-integration.service';
export type BatchActionInput = {
    type: string;
    payload: Record<string, unknown>;
    clientTimestamp?: string;
    clientVersion?: number;
};
export type BatchActionResult = {
    type: string;
    ok: boolean;
    error?: string;
    code?: string;
    statusCode?: number;
    serverState?: Record<string, unknown>;
    entityId?: number | string;
};
export declare class FieldSyncBatchProcessor {
    private readonly prisma;
    private readonly companyLinks;
    private readonly projects;
    private readonly equipmentLinks;
    private readonly trainingRecords;
    private readonly pmSafety;
    private readonly safetyForms;
    private readonly walletIntegration?;
    private readonly logger;
    constructor(prisma: PrismaService, companyLinks: CompanyLinksService, projects: ProjectsService, equipmentLinks: EquipmentLinksService, trainingRecords: TrainingRecordsService, pmSafety: PmSafetyWorkflowService, safetyForms: SafetyFormSubmissionsService, walletIntegration?: TrainingWalletIntegrationService);
    processOne(action: BatchActionInput, actorUserId: number): Promise<BatchActionResult>;
    private workerLink;
    private equipmentLink;
    private assignWorker;
    private assignEquipment;
    private inspectionSubmit;
    private trainingUpload;
    private qrTemp;
    private safetyFormSubmit;
    private safetyFormV2Submit;
}

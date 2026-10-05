import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import type { WorkerComplianceWidgetData } from '../dashboard-widgets.types';
export declare class WorkerCompliancePipeline {
    private readonly reporting;
    constructor(reporting: ReportingCoreService);
    run(companyId?: number): Promise<WorkerComplianceWidgetData>;
}

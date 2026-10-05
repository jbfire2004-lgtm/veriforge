import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import type { ProjectReadinessWidgetData } from '../dashboard-widgets.types';
export declare class ProjectReadinessPipeline {
    private readonly reporting;
    constructor(reporting: ReportingCoreService);
    run(companyId?: number): Promise<ProjectReadinessWidgetData>;
}

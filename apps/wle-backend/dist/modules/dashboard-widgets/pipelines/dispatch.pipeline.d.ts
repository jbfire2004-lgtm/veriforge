import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import type { UnionDispatchWidgetData } from '../dashboard-widgets.types';
export declare class DispatchPipeline {
    private readonly reporting;
    constructor(reporting: ReportingCoreService);
    run(unionHallId?: number, companyId?: number): Promise<UnionDispatchWidgetData>;
}

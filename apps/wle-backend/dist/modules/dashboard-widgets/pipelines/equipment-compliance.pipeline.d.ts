import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import type { EquipmentComplianceWidgetData } from '../dashboard-widgets.types';
export declare class EquipmentCompliancePipeline {
    private readonly reporting;
    constructor(reporting: ReportingCoreService);
    run(companyId?: number): Promise<EquipmentComplianceWidgetData>;
}

import { DashboardWidgetsService } from './dashboard-widgets.service';
import { DashboardWidgetsQueryDto } from './dto/dashboard-widgets-query.dto';
import type { DashboardWidgetScope } from './dashboard-widgets.service';
export declare class DashboardWidgetsController {
    private readonly widgets;
    constructor(widgets: DashboardWidgetsService);
    widgetsBundle(query: DashboardWidgetsQueryDto, req: {
        user?: {
            role?: string;
        };
    }): Promise<import("./dashboard-widgets.types").DashboardWidgetsBundle>;
}
export declare function resolveWidgetScope(role: string, companyId?: number, unionHallId?: number): DashboardWidgetScope;

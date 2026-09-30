import { WorkforceForecastingEngine } from "../engines/workforce-forecast";
import { EquipmentForecastingEngine } from "../engines/equipment-forecast";
import { TrainingForecastingEngine } from "../engines/training-forecast";
import { ProjectStaffingEngine } from "../engines/project-staffing";
import { DispatchOptimizationEngine } from "../engines/dispatch-optimization";
import { ShiftOptimizationEngine } from "../engines/shift-optimization";
import { CrewOptimizationEngine } from "../engines/crew-optimization";
import { ResourceAllocationEngine } from "../engines/resource-allocation";
import { MultiProjectBalancingEngine } from "../engines/multi-project-balancing";
import { AvailabilityPredictionEngine } from "../engines/availability-prediction";
import { AbsencePredictionEngine } from "../engines/absence-prediction";
import { OvertimePredictionEngine } from "../engines/overtime-prediction";
import { OfflineSchedulingEngine } from "../engines/offline-scheduling";
import { ScheduleEventEngine } from "../engines/schedule-events";
import { SchedulingAutomationEngine } from "../engines/scheduling-automation";
import type { PredictiveSchedulingReport, SchedulingContextInput } from "../types";
/**
 * Vera Predictive Scheduling Engine (VPSE)
 */
export declare class VeraPredictiveSchedulingEngine {
    readonly workforce: WorkforceForecastingEngine;
    readonly equipment: EquipmentForecastingEngine;
    readonly training: TrainingForecastingEngine;
    readonly staffing: ProjectStaffingEngine;
    readonly dispatch: DispatchOptimizationEngine;
    readonly shift: ShiftOptimizationEngine;
    readonly crew: CrewOptimizationEngine;
    readonly allocation: ResourceAllocationEngine;
    readonly balancing: MultiProjectBalancingEngine;
    readonly availability: AvailabilityPredictionEngine;
    readonly absence: AbsencePredictionEngine;
    readonly overtime: OvertimePredictionEngine;
    readonly offline: OfflineSchedulingEngine;
    readonly events: ScheduleEventEngine;
    readonly automation: SchedulingAutomationEngine;
    analyze(ctx: SchedulingContextInput): PredictiveSchedulingReport;
    analyzeOffline(ctx: SchedulingContextInput): PredictiveSchedulingReport;
    syncOffline(): PredictiveSchedulingReport[];
    onEvent(ctx: SchedulingContextInput, event: string, data?: Record<string, unknown>): PredictiveSchedulingReport;
    private buildDashboard;
}
//# sourceMappingURL=vera-predictive-scheduling-engine.d.ts.map
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
import { buildTwinSchedulingOverlay } from "../integrations/twin-integration";
import type {
  PredictiveSchedulingReport,
  SchedulingContextInput,
  SchedulingDashboardBundle,
} from "../types";

/**
 * Vera Predictive Scheduling Engine (VPSE)
 */
export class VeraPredictiveSchedulingEngine {
  readonly workforce = new WorkforceForecastingEngine();
  readonly equipment = new EquipmentForecastingEngine();
  readonly training = new TrainingForecastingEngine();
  readonly staffing = new ProjectStaffingEngine();
  readonly dispatch = new DispatchOptimizationEngine();
  readonly shift = new ShiftOptimizationEngine();
  readonly crew = new CrewOptimizationEngine();
  readonly allocation = new ResourceAllocationEngine();
  readonly balancing = new MultiProjectBalancingEngine();
  readonly availability = new AvailabilityPredictionEngine();
  readonly absence = new AbsencePredictionEngine();
  readonly overtime = new OvertimePredictionEngine();
  readonly offline = new OfflineSchedulingEngine();
  readonly events = new ScheduleEventEngine();
  readonly automation = new SchedulingAutomationEngine();

  analyze(ctx: SchedulingContextInput): PredictiveSchedulingReport {
    const workforce = this.workforce.analyze(ctx);
    const equipment = this.equipment.analyze(ctx);
    const training = this.training.analyze(ctx);
    const staffing = this.staffing.analyze(ctx);
    const dispatch = this.dispatch.analyze(ctx);
    const shift = this.shift.analyze(ctx);
    const crew = this.crew.analyze(ctx);
    const allocation = this.allocation.allocate(ctx, staffing);
    const balancing = this.balancing.analyze(ctx);
    const availability = this.availability.predict(ctx);
    const absence = this.absence.predict(ctx);
    const overtime = this.overtime.predict(ctx);

    const core = {
      generatedAt: new Date().toISOString(),
      context: ctx,
      workforce,
      equipment,
      training,
      staffing,
      dispatch,
      shift,
      crew,
      allocation,
      balancing,
      availability,
      absence,
      overtime,
    };

    const automation = this.automation.generate(core);
    const twinOverlay = buildTwinSchedulingOverlay(core);
    const dashboard = this.buildDashboard(core);

    return {
      ...core,
      automation,
      twinOverlay,
      dashboard,
    };
  }

  analyzeOffline(ctx: SchedulingContextInput): PredictiveSchedulingReport {
    const conflicts = this.offline.detectConflicts(ctx);
    this.offline.enqueue(ctx);
    const report = this.analyze({ ...ctx, offline: true });
    if (conflicts.length) {
      report.automation.alerts.push(...conflicts);
    }
    return report;
  }

  syncOffline(): PredictiveSchedulingReport[] {
    return this.offline.drain().map((item) =>
      this.offline.applyReport(this.analyze(item.context))
    );
  }

  onEvent(
    ctx: SchedulingContextInput,
    event: string,
    data?: Record<string, unknown>
  ): PredictiveSchedulingReport {
    return this.analyze(this.events.applyEvent(ctx, event, data));
  }

  private buildDashboard(
    report: Omit<PredictiveSchedulingReport, "dashboard" | "automation" | "twinOverlay">
  ): SchedulingDashboardBundle {
    const workers = report.context.workers ?? [];
    const avgReadiness =
      report.workforce.readiness.length > 0
        ? Math.round(
            report.workforce.readiness.reduce((s, r) => s + r.score, 0) /
              report.workforce.readiness.length
          )
        : 0;

    return {
      generatedAt: new Date().toISOString(),
      workforce: {
        availableCount: report.workforce.availability.filter((a) => a.probability >= 0.6).length,
        shortageCount: report.workforce.shortages.length,
        avgReadiness,
      },
      equipment: {
        availableCount: report.equipment.availability.filter((a) => a.probability >= 0.6).length,
        shortageCount: report.equipment.shortages.length,
        downtimeAlerts: report.equipment.downtimeRisk.length,
      },
      training: {
        expiringCount: report.training.expiring.filter((e) => e.daysLeft <= 30).length,
        gapCount: report.training.gaps.length,
      },
      staffing: {
        assignmentCount: report.staffing.workerAssignments.length,
        delayRiskCount: report.staffing.delayRisk.length,
      },
      dispatch: {
        conflictCount: report.dispatch.conflicts.length,
        optimizedCount: report.dispatch.optimizedOrder.length,
      },
      shift: {
        overtimeAlerts: report.shift.overtimeRisk.filter((o) => o.probability > 0.5).length,
        fatigueAlerts: report.shift.fatigueAlerts.length,
      },
      crew: {
        crewCount: report.crew.crews.length,
        avgReadiness:
          report.crew.crews.length > 0
            ? Math.round(
                report.crew.crews.reduce((s, c) => s + c.readinessScore, 0) /
                  report.crew.crews.length
              )
            : 0,
      },
      allocation: {
        workerMoves: report.allocation.workerAllocations.length,
        equipmentMoves: report.allocation.equipmentAllocations.length,
      },
      balancing: {
        conflictCount: report.balancing.conflicts.length,
        rebalanceCount: report.balancing.rebalanceActions.length,
      },
    };
  }
}

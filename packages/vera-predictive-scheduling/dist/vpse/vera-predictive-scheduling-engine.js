"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeraPredictiveSchedulingEngine = void 0;
const workforce_forecast_1 = require("../engines/workforce-forecast");
const equipment_forecast_1 = require("../engines/equipment-forecast");
const training_forecast_1 = require("../engines/training-forecast");
const project_staffing_1 = require("../engines/project-staffing");
const dispatch_optimization_1 = require("../engines/dispatch-optimization");
const shift_optimization_1 = require("../engines/shift-optimization");
const crew_optimization_1 = require("../engines/crew-optimization");
const resource_allocation_1 = require("../engines/resource-allocation");
const multi_project_balancing_1 = require("../engines/multi-project-balancing");
const availability_prediction_1 = require("../engines/availability-prediction");
const absence_prediction_1 = require("../engines/absence-prediction");
const overtime_prediction_1 = require("../engines/overtime-prediction");
const offline_scheduling_1 = require("../engines/offline-scheduling");
const schedule_events_1 = require("../engines/schedule-events");
const scheduling_automation_1 = require("../engines/scheduling-automation");
const twin_integration_1 = require("../integrations/twin-integration");
/**
 * Vera Predictive Scheduling Engine (VPSE)
 */
class VeraPredictiveSchedulingEngine {
    constructor() {
        this.workforce = new workforce_forecast_1.WorkforceForecastingEngine();
        this.equipment = new equipment_forecast_1.EquipmentForecastingEngine();
        this.training = new training_forecast_1.TrainingForecastingEngine();
        this.staffing = new project_staffing_1.ProjectStaffingEngine();
        this.dispatch = new dispatch_optimization_1.DispatchOptimizationEngine();
        this.shift = new shift_optimization_1.ShiftOptimizationEngine();
        this.crew = new crew_optimization_1.CrewOptimizationEngine();
        this.allocation = new resource_allocation_1.ResourceAllocationEngine();
        this.balancing = new multi_project_balancing_1.MultiProjectBalancingEngine();
        this.availability = new availability_prediction_1.AvailabilityPredictionEngine();
        this.absence = new absence_prediction_1.AbsencePredictionEngine();
        this.overtime = new overtime_prediction_1.OvertimePredictionEngine();
        this.offline = new offline_scheduling_1.OfflineSchedulingEngine();
        this.events = new schedule_events_1.ScheduleEventEngine();
        this.automation = new scheduling_automation_1.SchedulingAutomationEngine();
    }
    analyze(ctx) {
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
        const twinOverlay = (0, twin_integration_1.buildTwinSchedulingOverlay)(core);
        const dashboard = this.buildDashboard(core);
        return {
            ...core,
            automation,
            twinOverlay,
            dashboard,
        };
    }
    analyzeOffline(ctx) {
        const conflicts = this.offline.detectConflicts(ctx);
        this.offline.enqueue(ctx);
        const report = this.analyze({ ...ctx, offline: true });
        if (conflicts.length) {
            report.automation.alerts.push(...conflicts);
        }
        return report;
    }
    syncOffline() {
        return this.offline.drain().map((item) => this.offline.applyReport(this.analyze(item.context)));
    }
    onEvent(ctx, event, data) {
        return this.analyze(this.events.applyEvent(ctx, event, data));
    }
    buildDashboard(report) {
        const workers = report.context.workers ?? [];
        const avgReadiness = report.workforce.readiness.length > 0
            ? Math.round(report.workforce.readiness.reduce((s, r) => s + r.score, 0) /
                report.workforce.readiness.length)
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
                avgReadiness: report.crew.crews.length > 0
                    ? Math.round(report.crew.crews.reduce((s, c) => s + c.readinessScore, 0) /
                        report.crew.crews.length)
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
exports.VeraPredictiveSchedulingEngine = VeraPredictiveSchedulingEngine;
//# sourceMappingURL=vera-predictive-scheduling-engine.js.map
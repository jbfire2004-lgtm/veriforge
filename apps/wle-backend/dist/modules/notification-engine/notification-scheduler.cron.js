"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationSchedulerCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSchedulerCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const notification_scheduler_service_1 = require("./notification-scheduler.service");
let NotificationSchedulerCron = NotificationSchedulerCron_1 = class NotificationSchedulerCron {
    constructor(scheduler) {
        this.scheduler = scheduler;
        this.logger = new common_1.Logger(NotificationSchedulerCron_1.name);
    }
    async dailyComplianceNotifications() {
        var _a, _b;
        const startedAt = Date.now();
        this.logger.log('Running daily compliance notification scheduler');
        const steps = [];
        steps.push(await this.runStep('inspections', () => this.scheduler.runInspections()));
        steps.push(await this.runStep('competencyExpiry', () => this.scheduler.runCompetencyExpiry()));
        steps.push(await this.runStep('ppeExpiry', () => this.scheduler.runPpeExpiry()));
        steps.push(await this.runStep('maintenance', () => this.scheduler.runMaintenance()));
        steps.push(await this.runStep('trainingExpiry', () => this.scheduler.runTrainingExpiry()));
        steps.push(await this.runStep('equipmentCertExpiry', () => this.scheduler.runEquipmentCertExpiry()));
        steps.push(await this.runStep('fitTestExpiry', () => this.scheduler.runFitTestExpiry()));
        const durationMs = Date.now() - startedAt;
        const failed = steps.filter((s) => !s.ok);
        const training = (_a = steps.find((s) => s.name === 'trainingExpiry')) === null || _a === void 0 ? void 0 : _a.metrics;
        const equipment = (_b = steps.find((s) => s.name === 'equipmentCertExpiry')) === null || _b === void 0 ? void 0 : _b.metrics;
        this.logger.log(JSON.stringify({
            job: 'dailyComplianceNotifications',
            durationMs,
            steps: steps.map(({ name, ok, durationMs: stepMs, metrics, error }) => (Object.assign(Object.assign({ name,
                ok, durationMs: stepMs }, (metrics ? { metrics } : {})), (error ? { error } : {})))),
            summary: {
                trainingExpiry: training !== null && training !== void 0 ? training : null,
                equipmentCertExpiry: equipment !== null && equipment !== void 0 ? equipment : null,
                failedSteps: failed.map((s) => s.name),
            },
        }));
        if (failed.length) {
            this.logger.warn(`Daily compliance scheduler finished with ${failed.length} failed step(s): ${failed.map((s) => s.name).join(', ')}`);
        }
    }
    async hourlyAssignmentNotifications() {
        await this.scheduler.runWorkerAssignments();
        await this.scheduler.runEquipmentAssignments();
    }
    async runStep(name, fn) {
        const startedAt = Date.now();
        try {
            const result = await fn();
            const metrics = this.asExpiryMetrics(result);
            return Object.assign({ name, ok: true, durationMs: Date.now() - startedAt }, (metrics ? { metrics } : {}));
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.error(`Daily compliance step "${name}" failed: ${message}`);
            return {
                name,
                ok: false,
                durationMs: Date.now() - startedAt,
                error: message,
            };
        }
    }
    asExpiryMetrics(result) {
        if (!result || typeof result !== 'object')
            return undefined;
        const row = result;
        if (typeof row.scanned !== 'number' ||
            typeof row.processed !== 'number' ||
            typeof row.notified !== 'number') {
            return undefined;
        }
        return row;
    }
};
exports.NotificationSchedulerCron = NotificationSchedulerCron;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_6AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationSchedulerCron.prototype, "dailyComplianceNotifications", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationSchedulerCron.prototype, "hourlyAssignmentNotifications", null);
exports.NotificationSchedulerCron = NotificationSchedulerCron = NotificationSchedulerCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_scheduler_service_1.NotificationSchedulerService])
], NotificationSchedulerCron);
//# sourceMappingURL=notification-scheduler.cron.js.map
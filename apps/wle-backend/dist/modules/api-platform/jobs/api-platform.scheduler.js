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
var ApiPlatformScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiPlatformScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const analytics_service_1 = require("../../../analytics/analytics.service");
const reporting_core_service_1 = require("../../reporting-core/reporting-core.service");
const field_sync_service_1 = require("../../field-sync/field-sync.service");
const event_bus_service_1 = require("../events/event-bus.service");
const domain_events_1 = require("../events/domain-events");
let ApiPlatformScheduler = ApiPlatformScheduler_1 = class ApiPlatformScheduler {
    constructor(analytics, reporting, fieldSync, events) {
        this.analytics = analytics;
        this.reporting = reporting;
        this.fieldSync = fieldSync;
        this.events = events;
        this.logger = new common_1.Logger(ApiPlatformScheduler_1.name);
    }
    async trainingExpiryJob() {
        this.logger.log('TrainingExpiryJob started');
        const summary = await this.analytics.trainingExpirySummary();
        this.events.emit({
            name: domain_events_1.DomainEvent.TRAINING_UPLOADED,
            occurredAt: new Date().toISOString(),
            data: { job: 'TrainingExpiryJob', summary },
        });
    }
    async complianceRecalcJob() {
        this.logger.log('ComplianceRecalcJob started');
        await this.reporting.overview();
        this.events.emit({
            name: domain_events_1.DomainEvent.COMPLIANCE_RECALC,
            occurredAt: new Date().toISOString(),
            data: { job: 'ComplianceRecalcJob' },
        });
    }
    async inspectionScheduleJob() {
        this.logger.log('InspectionScheduleJob started');
        await this.reporting.inspectionStatus();
    }
    async syncQueueJob() {
        this.logger.debug('SyncQueueJob heartbeat');
        await this.fieldSync.processBatch([]);
    }
    async dispatchQueueJob() {
        this.logger.log('DispatchQueueJob started');
        await this.reporting.unionDispatchStatus();
    }
};
exports.ApiPlatformScheduler = ApiPlatformScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_5AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiPlatformScheduler.prototype, "trainingExpiryJob", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_6_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiPlatformScheduler.prototype, "complianceRecalcJob", null);
__decorate([
    (0, schedule_1.Cron)('0 7 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiPlatformScheduler.prototype, "inspectionScheduleJob", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiPlatformScheduler.prototype, "syncQueueJob", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ApiPlatformScheduler.prototype, "dispatchQueueJob", null);
exports.ApiPlatformScheduler = ApiPlatformScheduler = ApiPlatformScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService,
        reporting_core_service_1.ReportingCoreService,
        field_sync_service_1.FieldSyncService,
        event_bus_service_1.EventBusService])
], ApiPlatformScheduler);
//# sourceMappingURL=api-platform.scheduler.js.map
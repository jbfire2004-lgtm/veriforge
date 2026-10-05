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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncApiService = void 0;
const common_1 = require("@nestjs/common");
const field_sync_service_1 = require("../../field-sync/field-sync.service");
const dashboard_widgets_service_1 = require("../../dashboard-widgets/dashboard-widgets.service");
const dashboard_widgets_controller_1 = require("../../dashboard-widgets/dashboard-widgets.controller");
const event_bus_service_1 = require("../events/event-bus.service");
const domain_events_1 = require("../events/domain-events");
let SyncApiService = class SyncApiService {
    constructor(fieldSync, dashboardWidgets, events) {
        this.fieldSync = fieldSync;
        this.dashboardWidgets = dashboardWidgets;
        this.events = events;
    }
    processBatch(actions, actorUserId, meta) {
        this.events.emit({
            name: domain_events_1.DomainEvent.SYNC_BATCH,
            occurredAt: new Date().toISOString(),
            data: { count: actions.length },
        });
        return this.fieldSync.processBatch(actions, actorUserId, meta);
    }
    getDashboardWidgets(role, companyId, unionHallId) {
        const scope = (0, dashboard_widgets_controller_1.resolveWidgetScope)(role, companyId, unionHallId);
        return this.dashboardWidgets.getBundle(scope);
    }
};
exports.SyncApiService = SyncApiService;
exports.SyncApiService = SyncApiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [field_sync_service_1.FieldSyncService,
        dashboard_widgets_service_1.DashboardWidgetsService,
        event_bus_service_1.EventBusService])
], SyncApiService);
//# sourceMappingURL=sync-api.service.js.map
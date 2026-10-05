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
exports.AdoptionEventService = void 0;
const common_1 = require("@nestjs/common");
const adoption_event_queue_service_1 = require("./adoption-event-queue.service");
let AdoptionEventService = class AdoptionEventService {
    constructor(queue) {
        this.queue = queue;
    }
    track(input) {
        if (!input.companyId)
            return;
        const payload = {
            companyId: input.companyId,
            userId: input.userId,
            eventType: input.event,
            metadata: input.metadata,
        };
        this.queue.enqueue(payload);
    }
};
exports.AdoptionEventService = AdoptionEventService;
exports.AdoptionEventService = AdoptionEventService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [adoption_event_queue_service_1.AdoptionEventQueueService])
], AdoptionEventService);
//# sourceMappingURL=adoption-event.service.js.map
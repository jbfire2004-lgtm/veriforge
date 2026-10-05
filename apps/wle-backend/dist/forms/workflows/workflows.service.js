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
exports.SafetyFormWorkflowsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const form_engine_types_1 = require("../engine/form-engine.types");
let SafetyFormWorkflowsService = class SafetyFormWorkflowsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    assertTransition(from, to) {
        var _a;
        const allowed = (_a = form_engine_types_1.SAFETY_FORM_TRANSITIONS[from]) !== null && _a !== void 0 ? _a : [];
        if (!allowed.includes(to)) {
            throw new common_1.BadRequestException(`Cannot transition from ${from} to ${to}`);
        }
    }
    async transition(formId, to, actorId, note) {
        const form = await this.prisma.safetyForm.findUniqueOrThrow({
            where: { id: formId },
        });
        this.assertTransition(form.status, to);
        const updated = await this.prisma.safetyForm.update({
            where: { id: formId },
            data: {
                status: to,
                reviewedById: to === 'APPROVED' || to === 'REJECTED' ? actorId : form.reviewedById,
                reviewedAt: to === 'APPROVED' || to === 'REJECTED' ? new Date() : form.reviewedAt,
                submittedAt: to === 'SUBMITTED' ? new Date() : form.submittedAt,
                submittedById: to === 'SUBMITTED' ? actorId : form.submittedById,
            },
        });
        await this.prisma.safetyFormAuditLog.create({
            data: {
                formId,
                eventType: `transition:${form.status}->${to}`,
                actorId,
                payload: note ? { note } : undefined,
            },
        });
        return updated;
    }
    getDefinition() {
        return {
            statuses: Object.keys(form_engine_types_1.SAFETY_FORM_TRANSITIONS),
            transitions: form_engine_types_1.SAFETY_FORM_TRANSITIONS,
        };
    }
};
exports.SafetyFormWorkflowsService = SafetyFormWorkflowsService;
exports.SafetyFormWorkflowsService = SafetyFormWorkflowsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SafetyFormWorkflowsService);
//# sourceMappingURL=workflows.service.js.map
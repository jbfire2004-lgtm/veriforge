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
exports.SafetyFormAttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SafetyFormAttachmentsService = class SafetyFormAttachmentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async add(formId, input) {
        return this.prisma.safetyFormAttachment.create({
            data: Object.assign({ formId }, input),
        });
    }
    async list(formId) {
        return this.prisma.safetyFormAttachment.findMany({
            where: { formId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async remove(formId, attachmentId) {
        const row = await this.prisma.safetyFormAttachment.findFirst({
            where: { id: attachmentId, formId },
        });
        if (!row) {
            throw new common_2.NotFoundException('Attachment not found');
        }
        await this.prisma.safetyFormAttachment.delete({
            where: { id: attachmentId },
        });
        return { ok: true, id: attachmentId };
    }
};
exports.SafetyFormAttachmentsService = SafetyFormAttachmentsService;
exports.SafetyFormAttachmentsService = SafetyFormAttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SafetyFormAttachmentsService);
//# sourceMappingURL=attachments.service.js.map
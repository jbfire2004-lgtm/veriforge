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
exports.SafetyFormSignaturesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SafetyFormSignaturesService = class SafetyFormSignaturesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async capture(formId, input) {
        var _a;
        return this.prisma.safetyFormSignature.create({
            data: {
                formId,
                fieldId: input.fieldId,
                role: (_a = input.role) !== null && _a !== void 0 ? _a : 'WORKER',
                signerName: input.signerName,
                signerUserId: input.signerUserId,
                signatureData: input.signatureData,
            },
        });
    }
    async list(formId) {
        return this.prisma.safetyFormSignature.findMany({
            where: { formId },
            orderBy: { signedAt: 'asc' },
        });
    }
};
exports.SafetyFormSignaturesService = SafetyFormSignaturesService;
exports.SafetyFormSignaturesService = SafetyFormSignaturesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SafetyFormSignaturesService);
//# sourceMappingURL=signatures.service.js.map
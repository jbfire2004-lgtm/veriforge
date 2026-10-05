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
exports.TrainingProviderCertificateService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const QRCode = require("qrcode");
const prisma_service_1 = require("../../prisma/prisma.service");
const public_base_url_1 = require("../../config/public-base-url");
let TrainingProviderCertificateService = class TrainingProviderCertificateService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    newQrToken() {
        return `cert_${(0, crypto_1.randomBytes)(16).toString('hex')}`;
    }
    verificationPath(token) {
        return `/verify/certificate/${token}`;
    }
    apiValidationPath(token) {
        return `/api/v1/training-providers/certificates/validate/${token}`;
    }
    async buildDigitalCertificate(recordId) {
        var _a, _b, _c, _d, _e, _f;
        const record = await this.prisma.trainingRecord.findUnique({
            where: { id: recordId },
            include: {
                worker: true,
                certification: true,
                course: true,
                trainingProvider: true,
            },
        });
        if (!record)
            return null;
        const token = (_a = record.certificateQrToken) !== null && _a !== void 0 ? _a : (await this.ensureQrToken(recordId));
        const base = (0, public_base_url_1.resolvePublicBaseUrl)();
        return {
            recordId: record.id,
            workerId: record.workerId,
            workerName: `${record.worker.firstName} ${record.worker.lastName}`,
            certificationName: record.certification.name,
            courseName: (_b = record.course) === null || _b === void 0 ? void 0 : _b.name,
            providerName: (_d = (_c = record.trainingProvider) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : 'VERA Training',
            issuedAt: record.issuedAt.toISOString(),
            expiresAt: (_e = record.expiresAt) === null || _e === void 0 ? void 0 : _e.toISOString(),
            certificateNumber: (_f = record.certificateNumber) !== null && _f !== void 0 ? _f : undefined,
            verificationUrl: `${base}${this.verificationPath(token)}`,
        };
    }
    async generateQrDataUrl(recordId) {
        const cert = await this.buildDigitalCertificate(recordId);
        if (!cert)
            return null;
        return QRCode.toDataURL(cert.verificationUrl, { margin: 1, width: 256 });
    }
    async validateByToken(token) {
        var _a, _b;
        const record = await this.prisma.trainingRecord.findUnique({
            where: { certificateQrToken: token },
            include: {
                worker: true,
                certification: true,
                course: true,
                trainingProvider: true,
                instructor: true,
            },
        });
        if (!record) {
            return { valid: false, reason: 'NOT_FOUND' };
        }
        const expired = record.expiresAt ? record.expiresAt < new Date() : false;
        return {
            valid: !expired,
            expired,
            record: {
                id: record.id,
                workerId: record.workerId,
                workerName: `${record.worker.firstName} ${record.worker.lastName}`,
                certification: record.certification.name,
                course: (_a = record.course) === null || _a === void 0 ? void 0 : _a.name,
                provider: (_b = record.trainingProvider) === null || _b === void 0 ? void 0 : _b.name,
                instructor: record.instructor
                    ? `${record.instructor.firstName} ${record.instructor.lastName}`
                    : null,
                issuedAt: record.issuedAt,
                expiresAt: record.expiresAt,
                certificateNumber: record.certificateNumber,
                certificateUrl: record.certificateUrl,
            },
        };
    }
    async ensureQrToken(recordId) {
        const token = this.newQrToken();
        await this.prisma.trainingRecord.update({
            where: { id: recordId },
            data: { certificateQrToken: token },
        });
        return token;
    }
};
exports.TrainingProviderCertificateService = TrainingProviderCertificateService;
exports.TrainingProviderCertificateService = TrainingProviderCertificateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TrainingProviderCertificateService);
//# sourceMappingURL=training-provider-certificate.service.js.map
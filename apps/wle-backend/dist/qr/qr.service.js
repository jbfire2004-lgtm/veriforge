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
exports.QrService = void 0;
const common_1 = require("@nestjs/common");
const combined_service_1 = require("../combined/combined.service");
const verification_service_1 = require("../verification/verification.service");
const public_token_resolver_1 = require("../verification/public-token.resolver");
const qr_parse_util_1 = require("./qr-parse.util");
const training_provider_certificate_service_1 = require("../modules/training-provider-core/training-provider-certificate.service");
const wallet_routes_1 = require("../common/wallet-routes");
const public_token_util_1 = require("../verification/public-token.util");
let QrService = class QrService {
    constructor(combined, verify, trainingCertificates, publicTokens) {
        this.combined = combined;
        this.verify = verify;
        this.trainingCertificates = trainingCertificates;
        this.publicTokens = publicTokens;
    }
    async generateWorkerQr(workerId) {
        const token = await this.publicTokens.ensureWorkerToken(workerId);
        const url = (0, wallet_routes_1.workerVerifyUrlByToken)(token);
        return {
            type: 'worker',
            workerId,
            qrToken: token,
            content: url,
            verifyUrl: url,
            json: (0, wallet_routes_1.workerQrJsonPayload)(token, workerId),
        };
    }
    async generateEquipmentQr(equipmentId) {
        const token = await this.publicTokens.ensureEquipmentToken(equipmentId);
        const url = (0, wallet_routes_1.equipmentVerifyUrlByToken)(token);
        const payload = (0, wallet_routes_1.equipmentQrJsonPayload)(token, equipmentId);
        return {
            type: 'equipment',
            equipmentId,
            qrToken: token,
            content: url,
            verifyUrl: url,
            json: payload,
        };
    }
    generateCombinedQr(workerId, equipmentId) {
        const url = `${(0, wallet_routes_1.publicBaseUrl)()}/scan/combined?worker=${workerId}&equipment=${equipmentId}`;
        return {
            type: 'combined',
            workerId,
            equipmentId,
            content: url,
            legacy: true,
        };
    }
    async parseAndVerify(dto) {
        var _a;
        const qr = ((_a = dto.qr) !== null && _a !== void 0 ? _a : '').trim();
        if (!qr) {
            throw new common_1.BadRequestException('QR payload is required');
        }
        const assumedTarget = dto.assumedTarget;
        try {
            return await this.parseAndVerifyInner(qr, assumedTarget);
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException)
                throw err;
            throw new common_1.BadRequestException('QR verification failed');
        }
    }
    async parseAndVerifyInner(qr, assumedTarget) {
        var _a, _b;
        const certToken = (0, qr_parse_util_1.parseCertificateToken)(qr);
        if (certToken != null) {
            return this.trainingCertificates.validateByToken(certToken);
        }
        const tokenFromPath = this.extractPublicTokenFromUrl(qr);
        if (tokenFromPath) {
            return this.verify.verifyByPublicToken(tokenFromPath);
        }
        if (qr.startsWith('{')) {
            try {
                const typed = (0, qr_parse_util_1.parseTypedJsonQr)(qr);
                if ((typed === null || typed === void 0 ? void 0 : typed.kind) === 'equipment') {
                    const ref = (_a = typed.token) !== null && _a !== void 0 ? _a : String(typed.id);
                    return this.verify.verifyEquipmentByRef(ref);
                }
                if ((typed === null || typed === void 0 ? void 0 : typed.kind) === 'worker') {
                    const ref = (_b = typed.token) !== null && _b !== void 0 ? _b : String(typed.id);
                    return this.verify.verifyWorkerByRef(ref);
                }
            }
            catch (e) {
                if (e instanceof common_1.BadRequestException)
                    throw e;
                throw new common_1.BadRequestException('Invalid JSON QR code');
            }
            throw new common_1.BadRequestException('Invalid JSON QR code');
        }
        const combined = (0, qr_parse_util_1.parseCombinedUrlIds)(qr);
        if (combined != null) {
            return this.combined.verifyCombined(combined.workerId, combined.equipmentId);
        }
        const workerIdFromPath = (0, qr_parse_util_1.parseWorkerPathId)(qr);
        if (workerIdFromPath != null) {
            return this.verify.verifyWorkerByRef(String(workerIdFromPath));
        }
        const equipmentIdFromPath = (0, qr_parse_util_1.parseEquipmentPathId)(qr);
        if (equipmentIdFromPath != null) {
            return this.verify.verifyEquipmentByRef(String(equipmentIdFromPath));
        }
        if ((0, public_token_util_1.isPublicQrToken)(qr)) {
            return this.verify.verifyByPublicToken(qr);
        }
        if (/^\d+$/.test(qr)) {
            throw new common_1.BadRequestException('Numeric-only QR is not accepted on public scan — use a Vera token URL or JSON payload with token');
        }
        if (assumedTarget === 'equipment') {
            throw new common_1.BadRequestException('Unrecognized equipment QR');
        }
        if (assumedTarget === 'worker') {
            throw new common_1.BadRequestException('Unrecognized worker QR');
        }
        throw new common_1.BadRequestException('Unknown QR format');
    }
    extractPublicTokenFromUrl(qr) {
        var _a;
        const markers = ['/verify/t/', '/verify/token/'];
        for (const m of markers) {
            const i = qr.indexOf(m);
            if (i >= 0) {
                const rest = (_a = qr
                    .slice(i + m.length)
                    .split(/[/?#]/)[0]) === null || _a === void 0 ? void 0 : _a.trim();
                if (rest && (0, public_token_util_1.isPublicQrToken)(rest))
                    return rest;
            }
        }
        return null;
    }
};
exports.QrService = QrService;
exports.QrService = QrService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [combined_service_1.CombinedService,
        verification_service_1.VerificationService,
        training_provider_certificate_service_1.TrainingProviderCertificateService,
        public_token_resolver_1.PublicTokenResolver])
], QrService);
//# sourceMappingURL=qr.service.js.map
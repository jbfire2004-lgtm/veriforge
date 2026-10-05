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
exports.PmSafetyEventsLibraryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pm_safety_events_constants_1 = require("./pm-safety-events.constants");
let PmSafetyEventsLibraryService = class PmSafetyEventsLibraryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureLibraries(companyId) {
        for (const rc of pm_safety_events_constants_1.DEFAULT_ROOT_CAUSES) {
            await this.prisma.pmRootCauseLibraryEntry.upsert({
                where: { companyId_code: { companyId, code: rc.code } },
                create: Object.assign({ companyId }, rc),
                update: {},
            });
        }
        for (const cf of pm_safety_events_constants_1.DEFAULT_CONTRIBUTING_FACTORS) {
            await this.prisma.pmContributingFactorLibraryEntry.upsert({
                where: { companyId_code: { companyId, code: cf.code } },
                create: Object.assign({ companyId }, cf),
                update: {},
            });
        }
    }
    rootCauses(companyId) {
        return this.prisma.pmRootCauseLibraryEntry.findMany({
            where: { companyId, active: true },
            orderBy: { label: 'asc' },
        });
    }
    contributingFactors(companyId) {
        return this.prisma.pmContributingFactorLibraryEntry.findMany({
            where: { companyId, active: true },
            orderBy: { label: 'asc' },
        });
    }
};
exports.PmSafetyEventsLibraryService = PmSafetyEventsLibraryService;
exports.PmSafetyEventsLibraryService = PmSafetyEventsLibraryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PmSafetyEventsLibraryService);
//# sourceMappingURL=pm-safety-events-library.service.js.map
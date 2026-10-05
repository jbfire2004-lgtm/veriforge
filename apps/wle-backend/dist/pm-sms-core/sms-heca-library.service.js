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
exports.SmsHecaLibraryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const DEFAULT_HECA_ENTRIES = [
    {
        code: 'HECA_CRANE_LIFT',
        title: 'Critical crane lift',
        hecaType: 'critical_task',
        energyTypes: ['gravity', 'mechanical'],
        controls: ['lift_plan', 'exclusion_zone', 'signal_person'],
        verification: ['lift_plan_approved', 'rigging_inspected'],
    },
    {
        code: 'HECA_ENERGIZED_ELECTRICAL',
        title: 'Energized electrical work',
        hecaType: 'critical_task',
        energyTypes: ['electrical'],
        controls: ['lockout_tagout', 'arc_flash_ppe', 'qualified_person'],
        verification: ['loto_verified', 'voltage_tested'],
    },
    {
        code: 'HECA_CONFINED_SPACE',
        title: 'Confined space entry',
        hecaType: 'critical_task',
        energyTypes: ['chemical', 'pressure'],
        controls: ['entry_permit', 'atmospheric_monitoring', 'rescue_plan'],
        verification: ['gas_test_logged', 'attendant_assigned'],
    },
    {
        code: 'HECA_PRESSURE_VESSEL',
        title: 'Pressure vessel / system',
        hecaType: 'critical_equipment',
        energyTypes: ['pressure', 'thermal'],
        controls: ['pressure_relief', 'inspection_current'],
        verification: ['certification_valid'],
    },
];
let SmsHecaLibraryService = class SmsHecaLibraryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async seedDefaults(companyId, projectId) {
        for (const entry of DEFAULT_HECA_ENTRIES) {
            await this.prisma.pmSmsHecaLibraryEntry.upsert({
                where: { companyId_code: { companyId, code: entry.code } },
                create: {
                    companyId,
                    projectId,
                    code: entry.code,
                    title: entry.title,
                    hecaType: entry.hecaType,
                    energyTypesJson: entry.energyTypes,
                    requiredControlsJson: entry.controls,
                    verificationStepsJson: entry.verification,
                },
                update: {},
            });
        }
        return this.list(companyId, projectId);
    }
    async list(companyId, projectId, activeOnly = true) {
        return this.prisma.pmSmsHecaLibraryEntry.findMany({
            where: {
                companyId,
                OR: projectId ? [{ projectId }, { projectId: null }] : undefined,
                active: activeOnly ? true : undefined,
            },
            orderBy: { title: 'asc' },
        });
    }
    async create(companyId, data) {
        var _a, _b, _c, _d;
        return this.prisma.pmSmsHecaLibraryEntry.create({
            data: {
                companyId,
                projectId: data.projectId,
                code: data.code,
                title: data.title,
                description: data.description,
                hecaType: data.hecaType,
                requiredControlsJson: (_a = data.requiredControls) !== null && _a !== void 0 ? _a : [],
                verificationStepsJson: (_b = data.verificationSteps) !== null && _b !== void 0 ? _b : [],
                trainingCodesJson: (_c = data.trainingCodes) !== null && _c !== void 0 ? _c : [],
                energyTypesJson: (_d = data.energyTypes) !== null && _d !== void 0 ? _d : [],
            },
        });
    }
    async getByCode(companyId, code) {
        const row = await this.prisma.pmSmsHecaLibraryEntry.findUnique({
            where: { companyId_code: { companyId, code } },
        });
        if (!row)
            throw new common_1.NotFoundException(`HECA entry ${code} not found`);
        return row;
    }
};
exports.SmsHecaLibraryService = SmsHecaLibraryService;
exports.SmsHecaLibraryService = SmsHecaLibraryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SmsHecaLibraryService);
//# sourceMappingURL=sms-heca-library.service.js.map
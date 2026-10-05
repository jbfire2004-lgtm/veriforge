"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsEnergyWheelService = exports.ENERGY_WHEEL_TYPES = void 0;
const common_1 = require("@nestjs/common");
exports.ENERGY_WHEEL_TYPES = [
    { type: 'gravity', label: 'Gravity', defaultHighEnergy: true },
    { type: 'motion', label: 'Motion', defaultHighEnergy: false },
    { type: 'mechanical', label: 'Mechanical', defaultHighEnergy: true },
    { type: 'electrical', label: 'Electrical', defaultHighEnergy: true },
    { type: 'chemical', label: 'Chemical', defaultHighEnergy: true },
    { type: 'thermal', label: 'Thermal', defaultHighEnergy: false },
    { type: 'pressure', label: 'Pressure', defaultHighEnergy: true },
    { type: 'radiation', label: 'Radiation', defaultHighEnergy: true },
    { type: 'biological', label: 'Biological', defaultHighEnergy: false },
];
let SmsEnergyWheelService = class SmsEnergyWheelService {
    catalog() {
        return {
            energyTypes: exports.ENERGY_WHEEL_TYPES,
            controlStates: [
                'controlled',
                'uncontrolled',
                'partially_controlled',
            ],
        };
    }
    suggestControls(energyTypes) {
        const suggestions = [];
        for (const t of energyTypes) {
            switch (t) {
                case 'gravity':
                    suggestions.push('fall_protection', 'guardrails', 'exclusion_zone');
                    break;
                case 'electrical':
                    suggestions.push('lockout_tagout', 'insulated_tools', 'arc_rated_ppe');
                    break;
                case 'chemical':
                    suggestions.push('sds_available', 'ventilation', 'spill_kit');
                    break;
                case 'pressure':
                    suggestions.push('pressure_relief', 'bleed_down_procedure');
                    break;
                case 'mechanical':
                    suggestions.push('machine_guarding', 'lockout_tagout');
                    break;
                default:
                    suggestions.push('engineering_controls', 'administrative_controls');
            }
        }
        return [...new Set(suggestions)];
    }
    buildProfile(entries) {
        const highEnergy = entries.some((e) => e.highEnergy);
        const uncontrolled = entries.filter((e) => e.controlState === 'uncontrolled' ||
            e.controlState === 'partially_controlled');
        const gaps = entries.flatMap((e) => e.missingOrFailedControls);
        return {
            entries,
            highEnergy,
            uncontrolledCount: uncontrolled.length,
            systemicGaps: [...new Set(gaps)],
            suggestedControls: this.suggestControls(entries.map((e) => e.energyType)),
        };
    }
    inferFromText(text) {
        const lower = text.toLowerCase();
        const found = [];
        const rules = [
            [/fall|height|ladder|scaffold|gravity/, 'gravity'],
            [/electric|shock|arc|energized/, 'electrical'],
            [/chemical|spill|hazmat|solvent/, 'chemical'],
            [/pressure|steam|pipe|vessel/, 'pressure'],
            [/crush|pinch|rotating|machine/, 'mechanical'],
            [/heat|burn|thermal|fire/, 'thermal'],
            [/radiation|x-ray/, 'radiation'],
            [/vehicle|moving|traffic|motion/, 'motion'],
        ];
        for (const [re, type] of rules) {
            if (re.test(lower))
                found.push(type);
        }
        return [...new Set(found)];
    }
};
exports.SmsEnergyWheelService = SmsEnergyWheelService;
exports.SmsEnergyWheelService = SmsEnergyWheelService = __decorate([
    (0, common_1.Injectable)()
], SmsEnergyWheelService);
//# sourceMappingURL=sms-energy-wheel.service.js.map
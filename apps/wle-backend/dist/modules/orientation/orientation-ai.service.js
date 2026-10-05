"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrientationAiService = void 0;
const common_1 = require("@nestjs/common");
const orientation_constants_1 = require("./orientation.constants");
let OrientationAiService = class OrientationAiService {
    generate(input) {
        const base = [
            ...orientation_constants_1.DEFAULT_ORIENTATION_SECTIONS_EN,
            {
                id: 'industry',
                type: 'text',
                title: 'Industry context',
                body: `Industry: ${input.industry}. Business type: ${input.businessType}. Environment: ${input.workEnvironment}.`,
            },
            {
                id: 'hazards-site',
                type: 'list',
                title: 'Hazards present',
                body: input.hazards.join('\n'),
            },
            {
                id: 'ppe-site',
                type: 'list',
                title: 'PPE requirements',
                body: input.ppeRequirements.join('\n'),
            },
            {
                id: 'programs',
                type: 'list',
                title: 'Safety programs',
                body: input.safetyPrograms.join('\n'),
            },
            {
                id: 'whmis',
                type: 'text',
                title: 'WHMIS / SDS',
                body: 'Know how to access SDS, label requirements, and spill response for chemicals on site.',
            },
            {
                id: 'regulatory',
                type: 'text',
                title: 'Regulatory region',
                body: `This orientation aligns with requirements for ${input.regulatoryRegion}.`,
            },
        ];
        if (input.companyRules) {
            base.push({
                id: 'company-rules',
                type: 'text',
                title: 'Company rules',
                body: input.companyRules,
            });
        }
        if (input.siteRules) {
            base.push({
                id: 'site-rules',
                type: 'text',
                title: 'Site rules',
                body: input.siteRules,
            });
        }
        const sections = { en: base };
        for (const locale of orientation_constants_1.ORIENTATION_LOCALES) {
            if (locale === 'en')
                continue;
            sections[locale] = base.map((s) => (Object.assign(Object.assign({}, s), { title: `[${locale.toUpperCase()}] ${s.title}`, body: s.body })));
        }
        const quizEn = [
            {
                id: 'q1',
                prompt: 'Who must you notify before starting unfamiliar work?',
                choices: ['Supervisor', 'Nobody', 'Only HR'],
                answerIndex: 0,
            },
            {
                id: 'q2',
                prompt: 'When should you stop work?',
                choices: ['When unsafe', 'End of shift only', 'Never'],
                answerIndex: 0,
            },
        ];
        const quiz = { en: quizEn };
        for (const locale of orientation_constants_1.ORIENTATION_LOCALES) {
            if (locale === 'en')
                continue;
            quiz[locale] = quizEn;
        }
        return {
            sections,
            quiz,
            aiMetadata: Object.assign(Object.assign({}, input), { generator: 'vera-orientation-v1' }),
        };
    }
};
exports.OrientationAiService = OrientationAiService;
exports.OrientationAiService = OrientationAiService = __decorate([
    (0, common_1.Injectable)()
], OrientationAiService);
//# sourceMappingURL=orientation-ai.service.js.map
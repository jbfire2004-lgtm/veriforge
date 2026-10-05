"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrientationAiGenerateService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let OrientationAiGenerateService = class OrientationAiGenerateService {
    async generateFromText(input) {
        var _a, _b;
        const title = ((_a = input.title) === null || _a === void 0 ? void 0 : _a.trim()) || this.inferTitle(input.text);
        const paragraphs = input.text
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean)
            .slice(0, 12);
        const contentBlocks = paragraphs.map((body, i) => ({
            id: (0, crypto_1.randomUUID)(),
            type: i === 0 ? 'slide' : 'text',
            title: i === 0 ? title : `Section ${i}`,
            body: body.slice(0, 4000),
            order: i,
            meta: { source: 'generate-from-text' },
        }));
        if (!contentBlocks.length) {
            contentBlocks.push({
                id: (0, crypto_1.randomUUID)(),
                type: 'text',
                title,
                body: input.text.slice(0, 4000) || 'Orientation content',
                order: 0,
            });
        }
        contentBlocks.push({
            id: (0, crypto_1.randomUUID)(),
            type: 'policy_ack',
            title: 'Acknowledgement',
            body: 'I acknowledge that I have reviewed this orientation.',
            order: contentBlocks.length,
        });
        return {
            title,
            contentBlocks,
            metadata: {
                aiGenerated: true,
                source: 'text',
                companyId: input.companyId,
                type: (_b = input.type) !== null && _b !== void 0 ? _b : 'company',
                stub: true,
            },
        };
    }
    async generateFromFile(input) {
        var _a, _b;
        const text = ((_a = input.textExtract) === null || _a === void 0 ? void 0 : _a.trim()) ||
            `Orientation derived from uploaded file: ${input.fileName}`;
        const generated = await this.generateFromText({
            companyId: input.companyId,
            title: (_b = input.title) !== null && _b !== void 0 ? _b : input.fileName.replace(/\.[^.]+$/, ''),
            text,
        });
        return Object.assign(Object.assign({}, generated), { metadata: Object.assign(Object.assign({}, generated.metadata), { source: 'file', fileName: input.fileName, mimeType: input.mimeType }) });
    }
    async generateQuiz(input) {
        var _a;
        const count = Math.min(Math.max((_a = input.questionCount) !== null && _a !== void 0 ? _a : 3, 1), 10);
        const topic = input.topic || 'site safety';
        const contentBlocks = Array.from({ length: count }, (_, i) => ({
            id: (0, crypto_1.randomUUID)(),
            type: 'quiz',
            title: `Quiz ${i + 1}`,
            order: i,
            quiz: {
                prompt: `Regarding ${topic}: what is the correct first action if you identify a hazard?`,
                choices: [
                    'Stop work and notify your supervisor',
                    'Ignore it if minor',
                    'Continue and report later',
                    'Ask a coworker to handle it silently',
                ],
                answerIndex: 0,
            },
            meta: { stub: true, companyId: input.companyId },
        }));
        return { contentBlocks };
    }
    async improveBlock(input) {
        var _a, _b, _c;
        const instruction = ((_a = input.instruction) === null || _a === void 0 ? void 0 : _a.trim()) || 'Improve clarity';
        const improved = Object.assign(Object.assign({}, input.block), { id: input.block.id || (0, crypto_1.randomUUID)(), body: [
                ((_b = input.block.body) === null || _b === void 0 ? void 0 : _b.trim()) || '',
                '',
                `[AI improve: ${instruction}]`,
                'Keep language clear for field workers. Emphasize stop-work authority and reporting paths.',
            ]
                .filter(Boolean)
                .join('\n')
                .slice(0, 8000), meta: Object.assign(Object.assign({}, ((_c = input.block.meta) !== null && _c !== void 0 ? _c : {})), { aiImproved: true, instruction, stub: true, companyId: input.companyId }) });
        return { contentBlock: improved };
    }
    inferTitle(text) {
        var _a, _b;
        const first = (_b = (_a = text.split(/\n/)[0]) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '';
        if (first.length >= 8 && first.length <= 80)
            return first;
        return 'AI Orientation';
    }
};
exports.OrientationAiGenerateService = OrientationAiGenerateService;
exports.OrientationAiGenerateService = OrientationAiGenerateService = __decorate([
    (0, common_1.Injectable)()
], OrientationAiGenerateService);
//# sourceMappingURL=orientation-ai-generate.service.js.map
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
exports.OrientationUploadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const orientation_ai_service_1 = require("./orientation-ai.service");
const orientation_translation_service_1 = require("./orientation-translation.service");
const orientation_constants_1 = require("./orientation.constants");
let OrientationUploadService = class OrientationUploadService {
    constructor(prisma, ai, translate) {
        this.prisma = prisma;
        this.ai = ai;
        this.translate = translate;
    }
    async processUpload(packageId, files, userId) {
        const pkg = await this.prisma.orientationPackage.findUnique({
            where: { id: packageId },
            include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
        });
        if (!pkg)
            throw new Error('Package not found');
        const media = files.map((f) => ({
            filename: f.originalname,
            mime: f.mimetype,
            size: f.size,
            uploadedAt: new Date().toISOString(),
        }));
        const sectionsEn = this.sectionsFromFiles(files);
        const sections = this.translate.translateSections({ en: sectionsEn }, pkg.languages);
        const quiz = {
            en: [
                {
                    id: 'upload-q1',
                    prompt: 'Who do you contact for site-specific hazards?',
                    choices: ['Supervisor', 'Nobody', 'Public'],
                    answerIndex: 0,
                },
            ],
        };
        const nextVersion = pkg.version + 1;
        await this.prisma.orientationVersion.create({
            data: {
                packageId,
                versionNumber: nextVersion,
                sections: sections,
                media: media,
                quiz: quiz,
                aiMetadata: {
                    pipeline: 'upload-v1',
                    ocr: 'stub-smart-scan',
                    fileCount: files.length,
                },
                createdById: userId,
            },
        });
        await this.prisma.orientationPackage.update({
            where: { id: packageId },
            data: { version: nextVersion, type: 'UPLOAD', updatedById: userId },
        });
        return {
            packageId,
            version: nextVersion,
            sectionCount: sectionsEn.length,
            media,
        };
    }
    sectionsFromFiles(files) {
        if (!files.length) {
            return orientation_constants_1.DEFAULT_ORIENTATION_SECTIONS_EN;
        }
        const blocks = files.map((f, i) => ({
            id: `file-${i}`,
            type: 'text',
            title: f.originalname.replace(/\.[^.]+$/, ''),
            body: `Content imported from ${f.originalname} (${f.mimetype}). OCR and smart sectioning will refine this block in the next pipeline phase.`,
        }));
        return [...orientation_constants_1.DEFAULT_ORIENTATION_SECTIONS_EN.slice(0, 2), ...blocks];
    }
};
exports.OrientationUploadService = OrientationUploadService;
exports.OrientationUploadService = OrientationUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orientation_ai_service_1.OrientationAiService,
        orientation_translation_service_1.OrientationTranslationService])
], OrientationUploadService);
//# sourceMappingURL=orientation-upload.service.js.map
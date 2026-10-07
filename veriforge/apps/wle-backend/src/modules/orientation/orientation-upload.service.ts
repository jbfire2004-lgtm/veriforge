import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OrientationAiService } from './orientation-ai.service';
import { OrientationTranslationService } from './orientation-translation.service';
import { DEFAULT_ORIENTATION_SECTIONS_EN } from './orientation.constants';

type UploadFileMeta = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
};

@Injectable()
export class OrientationUploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: OrientationAiService,
    private readonly translate: OrientationTranslationService,
  ) {}

  async processUpload(
    packageId: string,
    files: UploadFileMeta[],
    userId?: number,
  ) {
    const pkg = await this.prisma.orientationPackage.findUnique({
      where: { id: packageId },
      include: { versions: { orderBy: { versionNumber: 'desc' }, take: 1 } },
    });
    if (!pkg) throw new Error('Package not found');

    const media = files.map((f) => ({
      filename: f.originalname,
      mime: f.mimetype,
      size: f.size,
      uploadedAt: new Date().toISOString(),
    }));

    const sectionsEn = this.sectionsFromFiles(files);
    const sections = this.translate.translateSections(
      { en: sectionsEn },
      pkg.languages,
    );

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
        sections: sections as Prisma.InputJsonValue,
        media: media as Prisma.InputJsonValue,
        quiz: quiz as Prisma.InputJsonValue,
        aiMetadata: {
          pipeline: 'upload-v1',
          ocr: 'stub-smart-scan',
          fileCount: files.length,
        } as Prisma.InputJsonValue,
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

  private sectionsFromFiles(files: UploadFileMeta[]) {
    if (!files.length) {
      return DEFAULT_ORIENTATION_SECTIONS_EN;
    }
    const blocks = files.map((f, i) => ({
      id: `file-${i}`,
      type: 'text',
      title: f.originalname.replace(/\.[^.]+$/, ''),
      body: `Content imported from ${f.originalname} (${f.mimetype}). OCR and smart sectioning will refine this block in the next pipeline phase.`,
    }));
    return [...DEFAULT_ORIENTATION_SECTIONS_EN.slice(0, 2), ...blocks];
  }
}

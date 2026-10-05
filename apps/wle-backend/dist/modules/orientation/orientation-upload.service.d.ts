import { PrismaService } from '../../prisma/prisma.service';
import { OrientationAiService } from './orientation-ai.service';
import { OrientationTranslationService } from './orientation-translation.service';
type UploadFileMeta = {
    originalname: string;
    mimetype: string;
    size: number;
    buffer?: Buffer;
};
export declare class OrientationUploadService {
    private readonly prisma;
    private readonly ai;
    private readonly translate;
    constructor(prisma: PrismaService, ai: OrientationAiService, translate: OrientationTranslationService);
    processUpload(packageId: string, files: UploadFileMeta[], userId?: number): Promise<{
        packageId: string;
        version: number;
        sectionCount: number;
        media: {
            filename: string;
            mime: string;
            size: number;
            uploadedAt: string;
        }[];
    }>;
    private sectionsFromFiles;
}
export {};

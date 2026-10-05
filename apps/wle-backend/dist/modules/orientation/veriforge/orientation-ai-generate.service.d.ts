import type { OrientationContentBlock } from './orientation.types';
export declare class OrientationAiGenerateService {
    generateFromText(input: {
        companyId: number;
        title?: string;
        text: string;
        type?: string;
    }): Promise<{
        title: string;
        contentBlocks: OrientationContentBlock[];
        metadata: Record<string, unknown>;
    }>;
    generateFromFile(input: {
        companyId: number;
        title?: string;
        fileName: string;
        mimeType?: string;
        textExtract?: string;
    }): Promise<{
        metadata: {
            source: string;
            fileName: string;
            mimeType: string;
        };
        title: string;
        contentBlocks: OrientationContentBlock[];
    }>;
    generateQuiz(input: {
        companyId: number;
        topic: string;
        contentBlocks?: OrientationContentBlock[];
        questionCount?: number;
    }): Promise<{
        contentBlocks: OrientationContentBlock[];
    }>;
    improveBlock(input: {
        companyId: number;
        block: OrientationContentBlock;
        instruction?: string;
    }): Promise<{
        contentBlock: OrientationContentBlock;
    }>;
    private inferTitle;
}

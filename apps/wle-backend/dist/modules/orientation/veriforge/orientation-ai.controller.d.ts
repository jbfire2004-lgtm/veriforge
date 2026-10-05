import { TenantScopeService } from '../../../security/tenant-scope.service';
import type { SecurityActor } from '../../../security/security.types';
import { OrientationAiGenerateService } from './orientation-ai-generate.service';
import type { OrientationContentBlock } from './orientation.types';
export declare class OrientationAiController {
    private readonly ai;
    private readonly tenant;
    constructor(ai: OrientationAiGenerateService, tenant: TenantScopeService);
    generateFromText(req: {
        user: SecurityActor;
    }, body: {
        companyId?: number;
        title?: string;
        text: string;
        type?: string;
    }): Promise<{
        title: string;
        contentBlocks: OrientationContentBlock[];
        metadata: Record<string, unknown>;
    }>;
    generateFromFile(req: {
        user: SecurityActor;
    }, body: {
        companyId?: number;
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
    generateQuiz(req: {
        user: SecurityActor;
    }, body: {
        companyId?: number;
        topic: string;
        contentBlocks?: OrientationContentBlock[];
        questionCount?: number;
    }): Promise<{
        contentBlocks: OrientationContentBlock[];
    }>;
    improveBlock(req: {
        user: SecurityActor;
    }, body: {
        companyId?: number;
        block: OrientationContentBlock;
        instruction?: string;
    }): Promise<{
        contentBlock: OrientationContentBlock;
    }>;
}

import { UserRole } from '@prisma/client';
import { CailScopeService } from '../cail/cail-scope.service';
import { VsiPresentationsService } from './presentations.service';
export declare class VsiPresentationsController {
    private readonly presentations;
    private readonly scope;
    constructor(presentations: VsiPresentationsService, scope: CailScopeService);
    generate(projectId: string, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
        projectId: number;
        generatedAt: string;
        slides: {
            title: string;
            bullets: string[];
        }[];
        narrative: string;
    }>;
}

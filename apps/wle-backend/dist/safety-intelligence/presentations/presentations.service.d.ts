import { PrismaService } from '../../prisma/prisma.service';
import { CailScopeService, type CailActor } from '../cail/cail-scope.service';
export declare class VsiPresentationsService {
    private readonly prisma;
    private readonly scope;
    constructor(prisma: PrismaService, scope: CailScopeService);
    generateProjectBrief(projectId: number, actor: CailActor): Promise<{
        projectId: number;
        generatedAt: string;
        slides: {
            title: string;
            bullets: string[];
        }[];
        narrative: string;
    }>;
}

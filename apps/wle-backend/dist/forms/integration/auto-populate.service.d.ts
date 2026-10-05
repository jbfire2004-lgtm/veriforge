import { PrismaService } from '../../prisma/prisma.service';
export type AutoPopulateContext = {
    workerId?: number;
    projectId?: number;
    companyId?: number;
    equipmentId?: number;
    userId?: number;
};
export declare class AutoPopulateService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    buildContext(ctx: AutoPopulateContext): Promise<Record<string, unknown>>;
}

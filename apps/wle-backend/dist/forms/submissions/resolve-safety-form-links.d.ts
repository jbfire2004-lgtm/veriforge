import { PrismaService } from '../../prisma/prisma.service';
export type SafetyFormLinkInput = {
    companyId?: number;
    projectId?: number;
    siteId?: number;
    workerId?: number;
    equipmentId?: number;
};
export type ResolveSafetyFormLinksOptions = {
    strict?: boolean;
};
export declare function resolveSafetyFormLinks(prisma: PrismaService, input: SafetyFormLinkInput, options?: ResolveSafetyFormLinksOptions): Promise<SafetyFormLinkInput>;

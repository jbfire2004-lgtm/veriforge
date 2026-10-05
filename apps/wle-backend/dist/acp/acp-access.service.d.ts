import { PrismaService } from '../prisma/prisma.service';
export type AcpAccessContext = {
    userId: number;
    tenantId: string | null;
    legacyRole: string;
    permissions: string[];
    features: string[];
    subscriptionTierKey: string | null;
    subscriptionStatus: string | null;
    isPlatformAdmin: boolean;
};
export type AcpAccessCheckInput = {
    userId: number;
    permission?: string;
    feature?: string;
    module?: string;
    minTier?: string;
};
export declare class AcpAccessService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    isLegacyPlatformAdmin(role: string): boolean;
    resolveContext(userId: number): Promise<AcpAccessContext>;
    check(input: AcpAccessCheckInput): Promise<{
        allowed: boolean;
        reason?: string;
    }>;
    hubModulesForUser(userId: number): Promise<Array<{
        moduleId: string;
        allowed: boolean;
        reason?: string;
    }>>;
    getModuleCardsForUser(userId: number): Promise<({
        key: "hub" | "core" | "pm" | "marketplace" | "addons";
        title: "Marketplace" | "Vera Hub" | "Vera Core" | "Vera PM" | "Add-ons";
        description: "Company pulse — feed, jobs, safety, and team updates." | "Workers, equipment, training, and compliance records." | "Project safety execution and unified safety hub." | "OCR, predictive, autonomous, command center." | "Industry ecosystem and integrations.";
        href: "/hub" | "/core/daily-logs" | "/pm" | "/subscriptions" | "/subscriptions?plan=marketplace";
        allowed: boolean;
        features: string[];
        reason?: undefined;
    } | {
        key: "hub" | "core" | "pm" | "marketplace" | "addons";
        title: "Marketplace" | "Vera Hub" | "Vera Core" | "Vera PM" | "Add-ons";
        description: "Company pulse — feed, jobs, safety, and team updates." | "Workers, equipment, training, and compliance records." | "Project safety execution and unified safety hub." | "OCR, predictive, autonomous, command center." | "Industry ecosystem and integrations.";
        href: "/hub" | "/core/daily-logs" | "/pm" | "/subscriptions" | "/subscriptions?plan=marketplace";
        allowed: boolean;
        reason: "permission" | "tier" | "feature";
        features: string[];
    })[]>;
}

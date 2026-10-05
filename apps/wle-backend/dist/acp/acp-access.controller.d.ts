import { AcpAccessService } from './acp-access.service';
type AuthReq = {
    user: {
        id: number;
        role?: string;
    };
};
export declare class AcpAccessController {
    private readonly access;
    constructor(access: AcpAccessService);
    getMyAccess(req: AuthReq): Promise<import("./acp-access.service").AcpAccessContext>;
    checkAccess(req: AuthReq, body: {
        permission?: string;
        feature?: string;
        module?: string;
        minTier?: string;
    }): Promise<{
        allowed: boolean;
        reason?: string;
    }>;
    hubModules(req: AuthReq): Promise<{
        moduleId: string;
        allowed: boolean;
        reason?: string;
    }[]>;
    moduleCards(req: AuthReq): Promise<({
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
export {};

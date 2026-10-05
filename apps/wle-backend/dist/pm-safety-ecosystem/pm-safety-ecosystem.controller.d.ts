export declare class PmSafetyEcosystemController {
    status(): {
        version: string;
        integration: string;
        eventBus: string;
        pillars: string[];
        modules: {
            id: string;
            api: string;
            ui: string;
            capabilities: string[];
        }[];
        domainLinks: Record<import(".prisma/client").$Enums.PmSafetyHubDomain, {
            href: string;
            label: string;
        }>;
        offlineSyncTypes: string[];
    };
}

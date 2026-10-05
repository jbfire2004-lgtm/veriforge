export declare const VERA_MODULE_CATALOG: readonly [{
    readonly key: "hub";
    readonly title: "Vera Hub";
    readonly description: "Company pulse — feed, jobs, safety, and team updates.";
    readonly href: "/hub";
    readonly permission: "hub.dashboard";
    readonly feature: "hub.social";
    readonly hubGateId: "hub";
}, {
    readonly key: "core";
    readonly title: "Vera Core";
    readonly description: "Workers, equipment, training, and compliance records.";
    readonly href: "/core/daily-logs";
    readonly permission: "core.access";
    readonly feature: "core.workers";
    readonly hubGateId: "core";
}, {
    readonly key: "pm";
    readonly title: "Vera PM";
    readonly description: "Project safety execution and unified safety hub.";
    readonly href: "/pm";
    readonly permission: "pm.access";
    readonly hubGateId: "pm";
}, {
    readonly key: "addons";
    readonly title: "Add-ons";
    readonly description: "OCR, predictive, autonomous, command center.";
    readonly href: "/subscriptions";
}, {
    readonly key: "marketplace";
    readonly title: "Marketplace";
    readonly description: "Industry ecosystem and integrations.";
    readonly href: "/subscriptions?plan=marketplace";
    readonly feature: "addon.marketplace";
}];

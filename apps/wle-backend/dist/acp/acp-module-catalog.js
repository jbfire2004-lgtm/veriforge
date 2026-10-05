"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERA_MODULE_CATALOG = void 0;
exports.VERA_MODULE_CATALOG = [
    {
        key: 'hub',
        title: 'Vera Hub',
        description: 'Company pulse — feed, jobs, safety, and team updates.',
        href: '/hub',
        permission: 'hub.dashboard',
        feature: 'hub.social',
        hubGateId: 'hub',
    },
    {
        key: 'core',
        title: 'Vera Core',
        description: 'Workers, equipment, training, and compliance records.',
        href: '/core/daily-logs',
        permission: 'core.access',
        feature: 'core.workers',
        hubGateId: 'core',
    },
    {
        key: 'pm',
        title: 'Vera PM',
        description: 'Project safety execution and unified safety hub.',
        href: '/pm',
        permission: 'pm.access',
        hubGateId: 'pm',
    },
    {
        key: 'addons',
        title: 'Add-ons',
        description: 'OCR, predictive, autonomous, command center.',
        href: '/subscriptions',
    },
    {
        key: 'marketplace',
        title: 'Marketplace',
        description: 'Industry ecosystem and integrations.',
        href: '/subscriptions?plan=marketplace',
        feature: 'addon.marketplace',
    },
];
//# sourceMappingURL=acp-module-catalog.js.map
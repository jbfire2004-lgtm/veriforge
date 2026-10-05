export declare const ACP_PERMISSIONS: readonly [{
    readonly key: "acp.manage";
    readonly module: "acp";
    readonly action: "manage";
    readonly description: "Full ACP administration";
}, {
    readonly key: "acp.tenants.read";
    readonly module: "acp";
    readonly action: "read";
    readonly description: "View tenants";
}, {
    readonly key: "acp.tenants.write";
    readonly module: "acp";
    readonly action: "write";
    readonly description: "Manage tenants";
}, {
    readonly key: "acp.users.read";
    readonly module: "acp";
    readonly action: "read";
    readonly description: "View users";
}, {
    readonly key: "acp.users.write";
    readonly module: "acp";
    readonly action: "write";
    readonly description: "Manage users";
}, {
    readonly key: "hub.dashboard";
    readonly module: "hub";
    readonly action: "access";
    readonly description: "Vera Hub home";
}, {
    readonly key: "core.access";
    readonly module: "core";
    readonly action: "access";
    readonly description: "Vera Core workspace";
}, {
    readonly key: "pm.access";
    readonly module: "pm";
    readonly action: "access";
    readonly description: "Project management workspace";
}, {
    readonly key: "pm.safety_hub";
    readonly module: "pm";
    readonly action: "access";
    readonly description: "Unified safety hub";
}, {
    readonly key: "pm.inspections";
    readonly module: "pm";
    readonly action: "access";
    readonly description: "Inspections module";
}, {
    readonly key: "pm.incidents";
    readonly module: "pm";
    readonly action: "access";
    readonly description: "Incidents module";
}, {
    readonly key: "pm.capa";
    readonly module: "pm";
    readonly action: "access";
    readonly description: "Corrective actions";
}, {
    readonly key: "pm.sms";
    readonly module: "pm";
    readonly action: "access";
    readonly description: "SMS core (SCL/HECA/Energy)";
}, {
    readonly key: "pm.safety_forms";
    readonly module: "pm";
    readonly action: "access";
    readonly description: "Safety forms";
}, {
    readonly key: "pm.substance_testing";
    readonly module: "pm";
    readonly action: "access";
    readonly description: "Drug & alcohol testing";
}, {
    readonly key: "pm.predictive";
    readonly module: "pm";
    readonly action: "access";
    readonly description: "Predictive analytics";
}, {
    readonly key: "contractor.portal";
    readonly module: "contractor";
    readonly action: "access";
    readonly description: "Contractor portal";
}, {
    readonly key: "admin.workers";
    readonly module: "admin";
    readonly action: "access";
    readonly description: "Worker directory";
}, {
    readonly key: "admin.equipment";
    readonly module: "admin";
    readonly action: "access";
    readonly description: "Equipment directory";
}, {
    readonly key: "admin.training";
    readonly module: "admin";
    readonly action: "access";
    readonly description: "Training admin";
}];
export declare const ACP_FEATURE_FLAGS: readonly [{
    readonly key: "hub.social";
    readonly name: "Hub social feed";
    readonly module: "hub";
    readonly requiredTierKey: "basic";
    readonly defaultEnabled: true;
}, {
    readonly key: "core.workers";
    readonly name: "Worker profiles";
    readonly module: "core";
    readonly requiredTierKey: "pro";
    readonly defaultEnabled: false;
}, {
    readonly key: "core.equipment";
    readonly name: "Equipment profiles";
    readonly module: "core";
    readonly requiredTierKey: "pro";
    readonly defaultEnabled: false;
}, {
    readonly key: "core.training";
    readonly name: "Training ingestion";
    readonly module: "core";
    readonly requiredTierKey: "pro";
    readonly defaultEnabled: false;
}, {
    readonly key: "pm.sms";
    readonly name: "SMS Core";
    readonly module: "pm";
    readonly requiredTierKey: "pm";
    readonly defaultEnabled: false;
}, {
    readonly key: "pm.inspections.ai";
    readonly name: "Inspection AI tagging";
    readonly module: "pm";
    readonly requiredTierKey: "pm";
    readonly defaultEnabled: false;
}, {
    readonly key: "pm.inspections.auto_failure_meeting";
    readonly name: "Auto safety meeting on failed inspection";
    readonly module: "pm";
    readonly requiredTierKey: "pm";
    readonly defaultEnabled: true;
}, {
    readonly key: "pm.predictive";
    readonly name: "Predictive analytics";
    readonly module: "pm";
    readonly requiredTierKey: "predictive";
    readonly defaultEnabled: false;
}, {
    readonly key: "contractor.portal";
    readonly name: "Contractor portal";
    readonly module: "contractor";
    readonly requiredTierKey: "pm";
    readonly defaultEnabled: false;
}, {
    readonly key: "pm.substance_testing";
    readonly name: "Substance testing";
    readonly module: "pm";
    readonly requiredTierKey: "pm";
    readonly defaultEnabled: false;
}, {
    readonly key: "addon.vision_ocr";
    readonly name: "Vision OCR";
    readonly module: "addon";
    readonly requiredTierKey: "pro";
    readonly defaultEnabled: false;
}, {
    readonly key: "addon.digital_twins";
    readonly name: "Digital twins";
    readonly module: "addon";
    readonly requiredTierKey: "predictive";
    readonly defaultEnabled: false;
}, {
    readonly key: "addon.autonomous";
    readonly name: "Autonomous dispatch";
    readonly module: "addon";
    readonly requiredTierKey: "autonomous";
    readonly defaultEnabled: false;
}, {
    readonly key: "addon.automation";
    readonly name: "Automation layer";
    readonly module: "addon";
    readonly requiredTierKey: "autonomous";
    readonly defaultEnabled: false;
}, {
    readonly key: "addon.command_center";
    readonly name: "Command center";
    readonly module: "addon";
    readonly requiredTierKey: "command_center";
    readonly defaultEnabled: false;
}, {
    readonly key: "addon.marketplace";
    readonly name: "Marketplace";
    readonly module: "addon";
    readonly requiredTierKey: "marketplace";
    readonly defaultEnabled: false;
}, {
    readonly key: "addon.global_intelligence";
    readonly name: "Global intelligence";
    readonly module: "addon";
    readonly requiredTierKey: "global_intelligence";
    readonly defaultEnabled: false;
}, {
    readonly key: "acp.enabled";
    readonly name: "Admin Control Panel";
    readonly module: "acp";
    readonly requiredTierKey: "enterprise";
    readonly defaultEnabled: false;
}, {
    readonly key: "wallet.mobile";
    readonly name: "Worker Wallet mobile";
    readonly module: "wallet";
    readonly requiredTierKey: "basic";
    readonly defaultEnabled: true;
}];
export declare const ACP_SUBSCRIPTION_TIERS: readonly [{
    readonly key: "free";
    readonly name: "Free (legacy)";
    readonly sortOrder: 0;
    readonly limitsJson: {
        readonly maxUsers: 10;
        readonly maxProjects: 2;
    };
    readonly featuresJson: readonly ["hub.social"];
}, {
    readonly key: "basic";
    readonly name: "Basic";
    readonly sortOrder: 1;
    readonly limitsJson: {
        readonly maxUsers: 10;
        readonly maxProjects: 2;
    };
    readonly featuresJson: readonly ["hub.social"];
}, {
    readonly key: "pro";
    readonly name: "Pro";
    readonly sortOrder: 2;
    readonly limitsJson: {
        readonly maxUsers: 50;
        readonly maxProjects: 10;
    };
    readonly featuresJson: readonly ["hub.social", "core.workers", "core.equipment", "core.training"];
}, {
    readonly key: "professional";
    readonly name: "Professional (legacy)";
    readonly sortOrder: 3;
    readonly limitsJson: {
        readonly maxUsers: 100;
        readonly maxProjects: 25;
    };
    readonly featuresJson: readonly ["hub.social", "core.workers", "core.equipment", "core.training", "pm.sms", "pm.inspections.ai", "contractor.portal", "pm.substance_testing"];
}, {
    readonly key: "pm";
    readonly name: "PM";
    readonly sortOrder: 4;
    readonly limitsJson: {
        readonly maxUsers: 200;
        readonly maxProjects: 50;
    };
    readonly featuresJson: readonly ["hub.social", "core.workers", "core.equipment", "core.training", "pm.sms", "pm.inspections.ai", "contractor.portal", "pm.substance_testing"];
}, {
    readonly key: "predictive";
    readonly name: "Predictive";
    readonly sortOrder: 5;
    readonly limitsJson: {
        readonly maxUsers: 500;
        readonly maxProjects: 100;
    };
    readonly featuresJson: readonly ["hub.social", "core.workers", "core.equipment", "core.training", "pm.sms", "pm.inspections.ai", "contractor.portal", "pm.substance_testing", "pm.predictive", "addon.digital_twins"];
}, {
    readonly key: "autonomous";
    readonly name: "Autonomous";
    readonly sortOrder: 6;
    readonly limitsJson: {
        readonly maxUsers: 1000;
        readonly maxProjects: 200;
    };
    readonly featuresJson: readonly ["hub.social", "core.workers", "core.equipment", "core.training", "pm.sms", "pm.inspections.ai", "contractor.portal", "pm.substance_testing", "pm.predictive", "addon.digital_twins", "addon.autonomous", "addon.automation"];
}, {
    readonly key: "enterprise";
    readonly name: "Enterprise";
    readonly sortOrder: 7;
    readonly limitsJson: {
        readonly maxUsers: 10000;
        readonly maxProjects: 1000;
    };
    readonly featuresJson: readonly ["hub.social", "core.workers", "core.equipment", "core.training", "pm.sms", "pm.inspections.ai", "contractor.portal", "pm.substance_testing", "pm.predictive", "addon.digital_twins", "addon.autonomous", "addon.automation", "addon.command_center", "addon.marketplace", "acp.enabled"];
}, {
    readonly key: "command_center";
    readonly name: "Command Center";
    readonly sortOrder: 8;
    readonly limitsJson: {
        readonly maxUsers: 5000;
        readonly maxProjects: 500;
    };
    readonly featuresJson: readonly ["hub.social", "core.workers", "core.equipment", "core.training", "pm.sms", "pm.inspections.ai", "contractor.portal", "pm.substance_testing", "pm.predictive", "addon.command_center"];
}, {
    readonly key: "global_intelligence";
    readonly name: "Global Intelligence";
    readonly sortOrder: 9;
    readonly limitsJson: {
        readonly maxUsers: 5000;
        readonly maxProjects: 500;
    };
    readonly featuresJson: readonly ["hub.social", "core.workers", "core.equipment", "core.training", "pm.sms", "pm.inspections.ai", "contractor.portal", "pm.substance_testing", "pm.predictive", "addon.digital_twins", "addon.global_intelligence"];
}, {
    readonly key: "marketplace";
    readonly name: "Marketplace";
    readonly sortOrder: 10;
    readonly limitsJson: {
        readonly maxUsers: 2000;
        readonly maxProjects: 200;
    };
    readonly featuresJson: readonly ["hub.social", "core.workers", "core.equipment", "core.training", "pm.sms", "addon.marketplace"];
}];
export declare const HUB_MODULE_GATES: Record<string, {
    permission?: string;
    feature?: string;
    minTier?: string;
}>;

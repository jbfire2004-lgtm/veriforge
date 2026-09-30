"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingProviderLifecycle = void 0;
const builder_1 = require("../builder");
exports.trainingProviderLifecycle = (0, builder_1.buildWorkflow)({
    id: "trainingProvider.lifecycle",
    title: "Training Provider Lifecycle",
    category: "trainingProvider",
    initialState: "pending",
    terminalStates: ["suspended", "archived"],
    modules: ["Training Providers", "Training", "Compliance"],
    steps: [
        { id: "create", label: "Provider creation", permissions: ["SUPER_ADMIN"] },
        { id: "approve", label: "Provider approval", permissions: ["SUPER_ADMIN"] },
        { id: "instructorOnboard", label: "Instructor onboarding", permissions: ["TRAINING_PROVIDER_ADMIN"] },
        { id: "courseCreate", label: "Course creation", permissions: ["TRAINING_PROVIDER_ADMIN"] },
        { id: "standardMap", label: "Course standard mapping", complianceChecks: ["csa.valid", "ohs.valid"] },
        { id: "issue", label: "Training issuance", permissions: ["TRAINING_PROVIDER_ADMIN"] },
        { id: "compliance", label: "Provider compliance", complianceChecks: ["provider.approved"] },
        { id: "expiry", label: "Provider expiry" },
        { id: "suspend", label: "Provider suspension", permissions: ["SUPER_ADMIN"] },
    ],
    transitions: [
        { from: "pending", to: "approved", event: "provider.approve", guards: ["provider.reviewed"] },
        { from: "approved", to: "active", event: "provider.instructorOnboard" },
        { from: "active", to: "coursesReady", event: "provider.courseCreate" },
        { from: "coursesReady", to: "mapped", event: "provider.standardMap", guards: ["csa.valid", "ohs.valid"] },
        { from: "mapped", to: "issuing", event: "provider.issueTraining" },
        { from: "issuing", to: "compliant", event: "compliance.pass" },
        { from: "compliant", to: "nonCompliant", event: "provider.complianceFail" },
        { from: "compliant", to: "expiring", event: "provider.expiryWarning" },
        { from: "expiring", to: "expired", event: "provider.expire" },
        { from: "compliant", to: "suspended", event: "provider.suspend" },
        { from: "expired", to: "archived", event: "provider.archive" },
    ],
});
//# sourceMappingURL=training-provider.js.map
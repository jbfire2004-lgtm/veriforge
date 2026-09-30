"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingLifecycle = void 0;
const builder_1 = require("../builder");
exports.trainingLifecycle = (0, builder_1.buildWorkflow)({
    id: "training.lifecycle",
    title: "Training Lifecycle",
    category: "training",
    initialState: "issued",
    terminalStates: ["expired", "archived"],
    modules: ["Training", "Compliance", "Wallets"],
    steps: [
        { id: "issue", label: "Provider issues training", permissions: ["TRAINING_PROVIDER_ADMIN"] },
        { id: "classList", label: "Instructor uploads class list", permissions: ["TRAINING_INSTRUCTOR"] },
        { id: "certificate", label: "Certificate upload", permissions: ["TRAINING_INSTRUCTOR"], offlineCapable: true },
        { id: "validate", label: "Compliance engine validation", complianceChecks: ["csa.valid", "ohs.valid", "provider.approved"] },
        { id: "walletWorker", label: "Worker wallet update" },
        { id: "walletCompany", label: "Company compliance update" },
        { id: "walletProject", label: "Project compliance update" },
        { id: "expiry", label: "Training expiry" },
        { id: "reject", label: "Training rejection", permissions: ["COMPANY_ADMIN"] },
        { id: "correct", label: "Training correction" },
        { id: "offlineUpload", label: "Offline training upload", offlineCapable: true },
        { id: "syncValidate", label: "Sync + validation" },
    ],
    transitions: [
        { from: "issued", to: "classListed", event: "training.classListUpload" },
        { from: "classListed", to: "certUploaded", event: "training.certificateUpload" },
        { from: "certUploaded", to: "validating", event: "training.submitValidation" },
        { from: "validating", to: "approved", event: "compliance.pass", guards: ["csa.valid", "ohs.valid", "provider.approved"] },
        { from: "validating", to: "rejected", event: "training.reject" },
        { from: "rejected", to: "correcting", event: "training.correction" },
        { from: "correcting", to: "validating", event: "training.resubmit" },
        { from: "approved", to: "walletSynced", event: "wallet.push" },
        { from: "walletSynced", to: "active", event: "compliance.propagate" },
        { from: "active", to: "expired", event: "training.expire" },
        { from: "issued", to: "offlinePending", event: "training.offlineUpload", guards: ["offline.mode"] },
        { from: "offlinePending", to: "validating", event: "sync.complete" },
        { from: "active", to: "archived", event: "training.archive" },
    ],
});
//# sourceMappingURL=training.js.map
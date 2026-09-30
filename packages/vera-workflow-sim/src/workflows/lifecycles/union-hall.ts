import { buildWorkflow } from "../builder";

export const unionHallLifecycle = buildWorkflow({
  id: "unionHall.lifecycle",
  title: "Union Hall Lifecycle",
  category: "unionHall",
  initialState: "memberPending",
  terminalStates: ["archived"],
  modules: ["Union Halls", "Training", "Compliance"],
  steps: [
    { id: "onboard", label: "Member onboarding", permissions: ["UNION_HALL_ADMIN"] },
    { id: "trainingUpload", label: "Training upload", permissions: ["UNION_HALL_ADMIN"], offlineCapable: true },
    { id: "dispatch", label: "Dispatch workflow", permissions: ["UNION_HALL_ADMIN"] },
    { id: "recall", label: "Recall workflow", permissions: ["UNION_HALL_ADMIN"] },
    { id: "compliance", label: "Member compliance", complianceChecks: ["training.valid"] },
    { id: "history", label: "Member history" },
  ],
  transitions: [
    { from: "memberPending", to: "memberActive", event: "union.memberOnboard" },
    { from: "memberActive", to: "trainingSynced", event: "union.trainingUpload" },
    { from: "trainingSynced", to: "compliant", event: "compliance.pass" },
    { from: "compliant", to: "dispatched", event: "union.dispatch" },
    { from: "dispatched", to: "onAssignment", event: "union.assignmentConfirm" },
    { from: "onAssignment", to: "recalled", event: "union.recall" },
    { from: "recalled", to: "compliant", event: "union.returnToHall" },
    { from: "compliant", to: "archived", event: "union.archiveMember" },
  ],
});

import { buildWorkflow } from "../builder";

export const companyLifecycle = buildWorkflow({
  id: "company.lifecycle",
  title: "Company Lifecycle",
  category: "company",
  initialState: "draft",
  terminalStates: ["closed"],
  modules: ["Companies", "Workers", "Equipment", "Projects", "Compliance"],
  steps: [
    { id: "create", label: "Company creation", permissions: ["SUPER_ADMIN"] },
    { id: "adminOnboard", label: "Admin onboarding", permissions: ["SUPER_ADMIN"] },
    { id: "linkWorkers", label: "Worker linking", permissions: ["COMPANY_ADMIN"] },
    { id: "linkEquipment", label: "Equipment linking", permissions: ["COMPANY_ADMIN"] },
    { id: "createProject", label: "Project creation", permissions: ["COMPANY_ADMIN"] },
    { id: "monitorCompliance", label: "Compliance monitoring", permissions: ["COMPANY_ADMIN"] },
    { id: "closeProject", label: "Project closure", permissions: ["COMPANY_ADMIN"] },
  ],
  transitions: [
    { from: "draft", to: "created", event: "company.create" },
    { from: "created", to: "adminReady", event: "company.adminOnboard" },
    { from: "adminReady", to: "operational", event: "company.activate" },
    { from: "operational", to: "rosterLinked", event: "company.linkWorkers" },
    { from: "rosterLinked", to: "assetsLinked", event: "company.linkEquipment" },
    { from: "assetsLinked", to: "projectsActive", event: "company.createProject" },
    { from: "projectsActive", to: "monitoring", event: "compliance.monitor" },
    { from: "monitoring", to: "projectsActive", event: "project.reopen" },
    { from: "projectsActive", to: "closing", event: "company.closeProject" },
    { from: "closing", to: "closed", event: "company.finalize" },
  ],
});

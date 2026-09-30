import type { ApiContractDefinition } from "./types";

const v1 = (path: string) => `/api/v1${path}`;

/** Canonical API contract registry for Vera Core (§3). */
export const API_CONTRACT_REGISTRY: ApiContractDefinition[] = [
  // —— Workers ——
  { id: "workers.create", endpoint: v1("/workers"), method: "POST", auth: "required", description: "Create worker", body: { firstName: "string", lastName: "string", companyId: "number?" } },
  { id: "workers.update", endpoint: v1("/workers/:id"), method: "PATCH", auth: "required", description: "Update worker", params: { id: "number" } },
  { id: "workers.get", endpoint: v1("/workers/:id"), method: "GET", auth: "required", description: "Get worker", params: { id: "number" } },
  { id: "workers.search", endpoint: v1("/workers/search"), method: "GET", auth: "required", description: "Search workers", query: { q: "string?", companyId: "number?" } },
  { id: "workers.linkCompany", endpoint: v1("/workers/:id/link-company"), method: "POST", auth: "required", description: "Link worker to company", body: { companyId: "number", role: "string?", trade: "string?" } },
  { id: "workers.unlinkCompany", endpoint: v1("/workers/:id/unlink-company"), method: "POST", auth: "required", description: "Unlink worker from company", body: { companyId: "number" } },
  { id: "workers.assignProject", endpoint: v1("/workers/:id/assign-project"), method: "POST", auth: "required", description: "Assign worker to project", body: { projectId: "number" } },
  { id: "workers.removeProject", endpoint: v1("/workers/:id/remove-project"), method: "POST", auth: "required", description: "Remove worker from project", body: { projectId: "number" } },
  { id: "workers.uploadTraining", endpoint: v1("/workers/:id/training"), method: "POST", auth: "required", description: "Upload worker training" },
  { id: "workers.wallet", endpoint: v1("/wallet/worker/:id"), method: "GET", auth: "required", description: "Get worker wallet", params: { id: "number" } },

  // —— Equipment ——
  { id: "equipment.create", endpoint: v1("/equipment"), method: "POST", auth: "required", description: "Create equipment" },
  { id: "equipment.update", endpoint: v1("/equipment/:id"), method: "PATCH", auth: "required", description: "Update equipment", params: { id: "number" } },
  { id: "equipment.get", endpoint: v1("/equipment/:id"), method: "GET", auth: "required", description: "Get equipment", params: { id: "number" } },
  { id: "equipment.search", endpoint: v1("/equipment"), method: "GET", auth: "required", description: "List/search equipment", query: { companyId: "number?" } },
  { id: "equipment.linkCompany", endpoint: v1("/equipment/:id/link-company"), method: "POST", auth: "required", description: "Link equipment to company", body: { companyId: "number" } },
  { id: "equipment.assignProject", endpoint: v1("/equipment/:id/assign-project"), method: "POST", auth: "required", description: "Assign equipment to project", body: { projectId: "number" } },
  { id: "equipment.inspect", endpoint: v1("/inspections"), method: "POST", auth: "required", description: "Record inspection" },
  { id: "equipment.lockout", endpoint: v1("/equipment/:id/lockout"), method: "POST", auth: "required", description: "Lock out equipment", params: { id: "number" } },
  { id: "equipment.unlock", endpoint: v1("/equipment/:id/unlock"), method: "POST", auth: "required", description: "Unlock equipment", params: { id: "number" } },
  { id: "equipment.wallet", endpoint: v1("/wallet/equipment/:id"), method: "GET", auth: "required", description: "Get equipment wallet", params: { id: "number" } },

  // —— Training ——
  { id: "training.upload", endpoint: v1("/training/upload"), method: "POST", auth: "required", description: "Upload training record" },
  { id: "training.validate", endpoint: v1("/training/validate"), method: "POST", auth: "required", description: "Validate training" },
  { id: "training.get", endpoint: v1("/training/:id"), method: "GET", auth: "required", description: "Get training record", params: { id: "number" } },
  { id: "training.byWorker", endpoint: v1("/training/worker/:workerId"), method: "GET", auth: "required", description: "Worker training list", params: { workerId: "number" } },

  // —— Providers ——
  { id: "providers.create", endpoint: v1("/providers"), method: "POST", auth: "required", description: "Create training provider" },
  { id: "providers.update", endpoint: v1("/providers/:id"), method: "PATCH", auth: "required", description: "Update provider", params: { id: "number" } },
  { id: "providers.addInstructor", endpoint: v1("/providers/:id/instructors"), method: "POST", auth: "required", description: "Add instructor" },
  { id: "providers.addCourse", endpoint: v1("/providers/:id/courses"), method: "POST", auth: "required", description: "Add course" },
  { id: "providers.issueCertificate", endpoint: v1("/providers/certificates/issue"), method: "POST", auth: "required", description: "Issue certificate" },
  { id: "providers.compliance", endpoint: v1("/providers/:id/compliance"), method: "GET", auth: "required", description: "Provider compliance" },

  // —— Union halls ——
  { id: "unionHalls.create", endpoint: v1("/union-halls"), method: "POST", auth: "required", description: "Create union hall" },
  { id: "unionHalls.addMember", endpoint: v1("/union-halls/:id/members"), method: "POST", auth: "required", description: "Add member" },
  { id: "unionHalls.dispatch", endpoint: v1("/union-halls/:id/dispatch"), method: "POST", auth: "required", description: "Dispatch worker" },
  { id: "unionHalls.recall", endpoint: v1("/union-halls/:id/recall"), method: "POST", auth: "required", description: "Recall worker" },

  // —— Companies ——
  { id: "companies.create", endpoint: v1("/companies"), method: "POST", auth: "required", description: "Create company" },
  { id: "companies.update", endpoint: v1("/companies/:id"), method: "PATCH", auth: "required", description: "Update company", params: { id: "number" } },
  { id: "companies.workers", endpoint: v1("/companies/:id/workers"), method: "GET", auth: "required", description: "Company workers" },
  { id: "companies.equipment", endpoint: v1("/companies/:id/equipment"), method: "GET", auth: "required", description: "Company equipment" },
  { id: "companies.compliance", endpoint: v1("/companies/:id/compliance"), method: "GET", auth: "required", description: "Company compliance" },

  // —— Projects ——
  { id: "projects.create", endpoint: v1("/projects"), method: "POST", auth: "required", description: "Create project" },
  { id: "projects.update", endpoint: v1("/projects/:id"), method: "PATCH", auth: "required", description: "Update project", params: { id: "number" } },
  { id: "projects.assignWorker", endpoint: v1("/projects/:id/assign-worker"), method: "POST", auth: "required", description: "Assign worker" },
  { id: "projects.assignEquipment", endpoint: v1("/projects/:id/assign-equipment"), method: "POST", auth: "required", description: "Assign equipment" },
  { id: "projects.readiness", endpoint: v1("/projects/:id/readiness"), method: "GET", auth: "required", description: "Project readiness" },
  { id: "projects.close", endpoint: v1("/projects/:id/close"), method: "POST", auth: "required", description: "Close project" },

  // —— Inspections ——
  { id: "inspections.create", endpoint: v1("/inspections"), method: "POST", auth: "required", description: "Create inspection" },
  { id: "inspections.get", endpoint: v1("/inspections/:id"), method: "GET", auth: "required", description: "Get inspection", params: { id: "number" } },
  { id: "inspections.history", endpoint: v1("/inspections/equipment/:equipmentId"), method: "GET", auth: "required", description: "Inspection history" },
  { id: "inspections.checklists", endpoint: v1("/inspections/checklists"), method: "GET", auth: "required", description: "Inspection checklists" },

  // —— Competency ——
  { id: "competency.evaluate", endpoint: v1("/competency/evaluate"), method: "POST", auth: "required", description: "Evaluate competency" },
  { id: "competency.history", endpoint: v1("/competency/worker/:workerId"), method: "GET", auth: "required", description: "Competency history" },
  { id: "competency.requirements", endpoint: v1("/competency/requirements"), method: "GET", auth: "required", description: "Competency requirements" },

  // —— Compliance ——
  { id: "compliance.worker", endpoint: v1("/compliance/worker/:id"), method: "GET", auth: "required", description: "Worker compliance" },
  { id: "compliance.equipment", endpoint: v1("/compliance/equipment/:id"), method: "GET", auth: "required", description: "Equipment compliance" },
  { id: "compliance.project", endpoint: v1("/compliance/project/:id"), method: "GET", auth: "required", description: "Project readiness" },
  { id: "compliance.trainingExpiry", endpoint: v1("/compliance/training-expiry"), method: "GET", auth: "required", description: "Training expiry summary" },

  // —— QR / Sync / Dashboard ——
  { id: "qr.scan", endpoint: v1("/qr/scan"), method: "POST", auth: "required", description: "Scan QR" },
  { id: "sync.batch", endpoint: v1("/sync/batch"), method: "POST", auth: "required", description: "Offline sync batch" },
  { id: "dashboard.widgets", endpoint: v1("/dashboard/widgets"), method: "GET", auth: "required", description: "Dashboard widgets bundle" },
];

export function getContractById(id: string): ApiContractDefinition | undefined {
  return API_CONTRACT_REGISTRY.find((c) => c.id === id);
}

export function contractsByTag(tag: string): ApiContractDefinition[] {
  return API_CONTRACT_REGISTRY.filter((c) => c.tags?.includes(tag));
}

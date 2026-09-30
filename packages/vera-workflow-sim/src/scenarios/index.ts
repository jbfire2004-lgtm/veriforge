import type { SimulationScenario } from "../types";

function happyWorker(): SimulationScenario {
  return {
    id: "worker.happy.full",
    name: "Worker lifecycle — happy path",
    workflowId: "worker.lifecycle",
    kind: "happy",
    context: { role: "COMPANY_ADMIN", companyId: "co-1", complianceFlags: { "training.valid": true, "competency.valid": true } },
    events: [
      { type: "worker.create" },
      { type: "worker.linkCompany" },
      { type: "worker.assignProject" },
      { type: "worker.activate" },
      { type: "compliance.pass" },
      { type: "worker.leaveProject" },
      { type: "worker.reassign" },
      { type: "compliance.pass" },
      { type: "worker.leaveCompany" },
      { type: "worker.archive" },
    ],
    expect: { finalState: "archived", noErrors: true },
  };
}

function workerOfflineQr(): SimulationScenario {
  return {
    id: "worker.offline.qr",
    name: "Worker QR scan offline → sync",
    workflowId: "worker.lifecycle",
    kind: "offline",
    context: {
      role: "COMPANY_ADMIN",
      offline: true,
      clientVersion: 2,
      serverVersion: 3,
      complianceFlags: { "training.valid": true, "competency.valid": true, "offline.mode": true },
    },
    events: [
      { type: "worker.create" },
      { type: "worker.linkCompany" },
      { type: "worker.skipProject" },
      { type: "compliance.pass" },
      { type: "worker.qrScanOffline" },
      { type: "sync.complete" },
    ],
    expect: { finalState: "compliant", noErrors: true },
  };
}

function workerPermissionDenied(): SimulationScenario {
  return {
    id: "worker.error.permission",
    name: "Worker create denied for WORKER role",
    workflowId: "worker.lifecycle",
    kind: "error",
    context: { role: "WORKER" },
    events: [{ type: "worker.create" }],
    expect: { noErrors: false, finalState: "draft" },
  };
}

function equipmentInspectionFail(): SimulationScenario {
  return {
    id: "equipment.error.lockout",
    name: "Equipment inspection fail → lockout",
    workflowId: "equipment.lifecycle",
    kind: "error",
    context: { role: "SUPERVISOR", complianceFlags: { "inspection.pass": false, "inspection.fail": true } },
    events: [
      { type: "equipment.create" },
      { type: "equipment.linkCompany" },
      { type: "equipment.assignProject" },
      { type: "equipment.requirePreUse" },
      { type: "inspection.preUseStart" },
      { type: "inspection.fail" },
    ],
    expect: { finalState: "failed", noErrors: true },
  };
}

function equipmentHappy(): SimulationScenario {
  return {
    id: "equipment.happy.full",
    name: "Equipment lifecycle — happy path",
    workflowId: "equipment.lifecycle",
    kind: "happy",
    context: { role: "COMPANY_ADMIN", complianceFlags: { "inspection.pass": true } },
    events: [
      { type: "equipment.create" },
      { type: "equipment.linkCompany" },
      { type: "equipment.assignProject" },
      { type: "equipment.requirePreUse" },
      { type: "inspection.preUseStart" },
      { type: "inspection.preUsePass" },
      { type: "inspection.scheduleDue" },
      { type: "inspection.scheduledPass" },
    ],
    expect: { finalState: "operational", noErrors: true },
  };
}

function trainingHappy(): SimulationScenario {
  return {
    id: "training.happy.full",
    name: "Training lifecycle — approve and wallet sync",
    workflowId: "training.lifecycle",
    kind: "happy",
    context: {
      role: "TRAINING_INSTRUCTOR",
      complianceFlags: { "csa.valid": true, "ohs.valid": true, "provider.approved": true },
    },
    events: [
      { type: "training.classListUpload" },
      { type: "training.certificateUpload" },
      { type: "training.submitValidation" },
      { type: "compliance.pass" },
      { type: "wallet.push" },
      { type: "compliance.propagate" },
    ],
    expect: { finalState: "active", noErrors: true },
  };
}

function trainingReject(): SimulationScenario {
  return {
    id: "training.error.reject",
    name: "Training rejected — CSA fail",
    workflowId: "training.lifecycle",
    kind: "error",
    context: {
      role: "COMPANY_ADMIN",
      complianceFlags: { "csa.valid": false, "ohs.valid": true, "provider.approved": true },
    },
    events: [
      { type: "training.classListUpload" },
      { type: "training.certificateUpload" },
      { type: "training.submitValidation" },
      { type: "training.reject" },
    ],
    expect: { finalState: "rejected", noErrors: true },
  };
}

function providerHappy(): SimulationScenario {
  return {
    id: "provider.happy.full",
    name: "Training provider lifecycle",
    workflowId: "trainingProvider.lifecycle",
    kind: "happy",
    context: { role: "SUPER_ADMIN", complianceFlags: { "csa.valid": true, "ohs.valid": true, "provider.reviewed": true } },
    events: [
      { type: "provider.approve" },
      { type: "provider.instructorOnboard" },
      { type: "provider.courseCreate" },
      { type: "provider.standardMap" },
      { type: "provider.issueTraining" },
      { type: "compliance.pass" },
    ],
    expect: { finalState: "compliant", noErrors: true },
  };
}

function unionHappy(): SimulationScenario {
  return {
    id: "union.happy.dispatch",
    name: "Union hall dispatch workflow",
    workflowId: "unionHall.lifecycle",
    kind: "happy",
    context: { role: "UNION_HALL_ADMIN", complianceFlags: { "training.valid": true } },
    events: [
      { type: "union.memberOnboard" },
      { type: "union.trainingUpload" },
      { type: "compliance.pass" },
      { type: "union.dispatch" },
      { type: "union.assignmentConfirm" },
    ],
    expect: { finalState: "onAssignment", noErrors: true },
  };
}

function companyHappy(): SimulationScenario {
  return {
    id: "company.happy.full",
    name: "Company lifecycle",
    workflowId: "company.lifecycle",
    kind: "happy",
    context: { role: "SUPER_ADMIN" },
    events: [
      { type: "company.create" },
      { type: "company.adminOnboard" },
      { type: "company.activate" },
      { type: "company.linkWorkers" },
      { type: "company.linkEquipment" },
      { type: "company.createProject" },
      { type: "compliance.monitor" },
    ],
    expect: { finalState: "monitoring", noErrors: true },
  };
}

function projectHappy(): SimulationScenario {
  return {
    id: "project.happy.full",
    name: "Project lifecycle — readiness to close",
    workflowId: "project.lifecycle",
    kind: "happy",
    context: { role: "SUPERVISOR", complianceFlags: { "project.readiness": true } },
    events: [
      { type: "project.create" },
      { type: "project.assignWorkers" },
      { type: "project.assignEquipment" },
      { type: "project.readinessStart" },
      { type: "compliance.pass" },
      { type: "project.startOps" },
      { type: "project.close" },
    ],
    expect: { finalState: "closing", noErrors: true },
  };
}

function complianceBlock(): SimulationScenario {
  return {
    id: "compliance.error.block",
    name: "Compliance blocked on training expiry",
    workflowId: "compliance.lifecycle",
    kind: "error",
    context: { role: "SUPERVISOR" },
    events: [
      { type: "training.expire" },
      { type: "compliance.block" },
    ],
    expect: { finalState: "blocked", noErrors: false },
  };
}

function inspectionConflict(): SimulationScenario {
  return {
    id: "inspection.conflict.offline",
    name: "Offline inspection sync conflict",
    workflowId: "inspection.lifecycle",
    kind: "conflict",
    context: { role: "SUPERVISOR", offline: true, complianceFlags: { "offline.mode": true } },
    events: [
      { type: "inspection.preUseStart" },
      { type: "inspection.offlineSubmit" },
      { type: "sync.conflict" },
      { type: "sync.resolve.merge" },
    ],
    expect: { conflictCount: 0, noErrors: true },
  };
}

function competencyOverride(): SimulationScenario {
  return {
    id: "competency.edge.override",
    name: "Competency failure with admin override",
    workflowId: "competency.lifecycle",
    kind: "edge",
    context: { role: "COMPANY_ADMIN" },
    events: [
      { type: "competency.start" },
      { type: "competency.fail" },
      { type: "competency.override" },
    ],
    expect: { finalState: "overridden", noErrors: true },
  };
}

function offlineSyncFull(): SimulationScenario {
  return {
    id: "offline.happy.sync",
    name: "Offline queue → batch sync",
    workflowId: "offlineSync.lifecycle",
    kind: "offline",
    context: { role: "SUPERVISOR", offline: true, clientVersion: 1, serverVersion: 1 },
    events: [
      { type: "connectivity.lost" },
      { type: "offline.action" },
      { type: "connectivity.restored" },
      { type: "sync.batchComplete" },
      { type: "sync.ack" },
    ],
    expect: { finalState: "online", noErrors: true },
  };
}

function offlineConflict(): SimulationScenario {
  return {
    id: "offline.conflict.project",
    name: "Offline assign to closed project",
    workflowId: "offlineSync.lifecycle",
    kind: "conflict",
    context: {
      role: "SUPERVISOR",
      offline: true,
      complianceFlags: { "offline.mode": true, "project.closed": true },
    },
    events: [
      { type: "connectivity.lost" },
      { type: "offline.action" },
      { type: "connectivity.restored" },
      { type: "sync.conflict" },
      { type: "sync.resolve" },
    ],
    expect: { noErrors: false },
  };
}

function dashboardRealtime(): SimulationScenario {
  return {
    id: "dashboard.happy.realtime",
    name: "Dashboard pipelines and realtime",
    workflowId: "dashboard.lifecycle",
    kind: "happy",
    context: { role: "SUPERVISOR" },
    events: [
      { type: "dashboard.fetch" },
      { type: "dashboard.pipelinesReady" },
      { type: "dashboard.realtimeTick" },
      { type: "dashboard.renderComplete" },
    ],
    expect: { finalState: "live", noErrors: true },
  };
}

function dashboardOfflineRefresh(): SimulationScenario {
  return {
    id: "dashboard.offline.refresh",
    name: "Dashboard offline cache → sync refresh",
    workflowId: "dashboard.lifecycle",
    kind: "offline",
    context: { role: "SUPERVISOR", offline: true, complianceFlags: { "offline.mode": true } },
    events: [
      { type: "dashboard.fetch" },
      { type: "dashboard.pipelinesReady" },
      { type: "connectivity.lost" },
      { type: "sync.complete" },
      { type: "dashboard.syncRefresh" },
    ],
    expect: { finalState: "live", noErrors: true },
  };
}

function multiCompanyWorker(): SimulationScenario {
  return {
    id: "worker.multiCompany.transfer",
    name: "Worker transfer between companies",
    workflowId: "worker.lifecycle",
    kind: "multiCompany",
    context: {
      role: "COMPANY_ADMIN",
      multiCompany: true,
      companyId: "co-a",
      complianceFlags: { "training.valid": true, "competency.valid": true },
    },
    events: [
      { type: "worker.create" },
      { type: "worker.linkCompany" },
      { type: "worker.skipProject" },
      { type: "compliance.pass" },
      { type: "worker.leaveCompany" },
      { type: "worker.transferCompany" },
      { type: "worker.linkCompany" },
    ],
    expect: { finalState: "linked", noErrors: true },
  };
}

function multiUserProject(): SimulationScenario {
  return {
    id: "project.multiUser.ops",
    name: "Project ops — supervisor + PM paths",
    workflowId: "project.lifecycle",
    kind: "multiUser",
    context: { role: "PROJECT_MANAGER", complianceFlags: { "project.readiness": true }, actorIds: ["u1", "u2"] },
    events: [
      { type: "project.create" },
      { type: "project.assignWorkers" },
      { type: "project.assignEquipment" },
      { type: "project.readinessStart" },
      { type: "compliance.pass" },
      { type: "project.startOps" },
      { type: "compliance.monitor" },
    ],
    expect: { finalState: "monitoring", noErrors: true },
  };
}

export const ALL_SCENARIOS: SimulationScenario[] = [
  happyWorker(),
  workerOfflineQr(),
  workerPermissionDenied(),
  equipmentHappy(),
  equipmentInspectionFail(),
  trainingHappy(),
  trainingReject(),
  providerHappy(),
  unionHappy(),
  companyHappy(),
  projectHappy(),
  complianceBlock(),
  inspectionConflict(),
  competencyOverride(),
  offlineSyncFull(),
  offlineConflict(),
  dashboardRealtime(),
  dashboardOfflineRefresh(),
  multiCompanyWorker(),
  multiUserProject(),
];

export function scenariosForWorkflow(workflowId: string): SimulationScenario[] {
  return ALL_SCENARIOS.filter((s) => s.workflowId === workflowId);
}

/**
 * VeriForge tRPC procedure map (mirrors backend/src/server/api/root.ts).
 * Use as a compile-time checklist when adding SaaS endpoints.
 */
export const VERIFORGE_API_ROUTE_MAP = {
  org: [
    'createOrganization',
    'createUser',
    'createRole',
    'updateModules',
    'getOrganization',
    'getUsers',
    'getRoles',
    'getModules',
  ],
  client: [
    'getContractors',
    'getContractorScorecard',
    'getContractorCompliance',
    'awardContract',
    'reviewCompliance',
  ],
  developer: [
    'getOrganizations',
    'getLogs',
    'impersonateUser',
    'createModule',
    'updateModule',
    'toggleFeatureFlag',
  ],
  compliance: [
    'uploadArtifact',
    'reviewArtifact',
    'updateArtifact',
    'getComplianceStatus',
    'getArtifacts',
  ],
  scorecards: [
    'getScorecard',
    'recalculateScorecard',
    'getProjectScorecard',
    'getGlobalScorecard',
  ],
  modules: ['listModules', 'updateModules', 'getModuleStatus', 'catalog'],
  billing: ['getBillingProfile', 'updateBilling', 'updatePlan'],
  auth: ['login', 'register', 'clientLogin', 'developerLogin', 'logout', 'me'],
  notifications: ['sendNotification', 'getNotifications'],
  cron: ['runComplianceExpiryCheck', 'runScorecardRecalculation'],
} as const;

export type VeriforgeApiNamespace = keyof typeof VERIFORGE_API_ROUTE_MAP;

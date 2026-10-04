export type OrteIssueSeverity = 'High' | 'Medium' | 'Low';

export type OrteKnownIssue = {
  id: string;
  severity: OrteIssueSeverity;
  description: string;
};

export type OrteEngineInput = {
  name: string;
  unitTestsPassRate: number;
  integrationTestsPassRate: number;
  knownIssues: OrteKnownIssue[];
  testScenariosImplemented: string[];
  testScenariosMissing: string[];
};

export type OrteIntegrationLink = {
  implemented: boolean;
  tested: boolean;
  issues: OrteKnownIssue[];
};

export type OrteIntegrationInput = {
  taeToSpce?: OrteIntegrationLink;
  spceToSgae?: OrteIntegrationLink;
  sgaeToCail?: OrteIntegrationLink;
  [key: string]: OrteIntegrationLink | undefined;
};

export type OrtePerformanceInput = {
  loadTested: boolean;
  maxObservedResponseTimeMs?: number;
  targetResponseTimeMs?: number;
};

export type OrteSecurityInput = {
  basicAuthImplemented?: boolean;
  rolePermissionsTested: boolean;
};

export type OrteLoggingInput = {
  auditTrailImplemented: boolean;
  errorLoggingImplemented: boolean;
};

export type OrteNonFunctionalInput = {
  performance: OrtePerformanceInput;
  security: OrteSecurityInput;
  logging: OrteLoggingInput;
};

export type OrteAssessmentInput = {
  engines: OrteEngineInput[];
  integration: OrteIntegrationInput;
  nonFunctional: OrteNonFunctionalInput;
};

export type OrteReadinessClassification =
  | 'Ready'
  | 'NeedsAttention'
  | 'NotReady';

export type OrteEngineReadiness = {
  name: string;
  score: number;
  classification: OrteReadinessClassification;
  keyIssues: string[];
  missingScenarios: string[];
};

export type OrteSectionReadiness = {
  score: number;
  classification: OrteReadinessClassification;
  keyIssues: string[];
};

export type OrteBlockingIssue = {
  id: string;
  description: string;
  recommendedAction: string;
  priority: 'High';
};

export type OrteOverallRecommendation = 'Go' | 'GoWithRisks' | 'NoGo';

export type OrteAssessmentResult = {
  engineReadiness: OrteEngineReadiness[];
  integrationReadiness: OrteSectionReadiness;
  nonFunctionalReadiness: OrteSectionReadiness;
  overallLaunchReadinessScore: number;
  overallRecommendation: OrteOverallRecommendation;
  topBlockingIssues: OrteBlockingIssue[];
  nextSteps: string[];
};

import type {
  OrteAssessmentInput,
  OrteAssessmentResult,
  OrteBlockingIssue,
  OrteEngineInput,
  OrteIntegrationInput,
  OrteIntegrationLink,
  OrteKnownIssue,
  OrteNonFunctionalInput,
  OrteOverallRecommendation,
  OrteReadinessClassification,
} from './operational-readiness.types';

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function classifyReadiness(score: number): OrteReadinessClassification {
  if (score >= 85) return 'Ready';
  if (score >= 70) return 'NeedsAttention';
  return 'NotReady';
}

function overallRecommendation(score: number): OrteOverallRecommendation {
  if (score >= 85) return 'Go';
  if (score >= 70) return 'GoWithRisks';
  return 'NoGo';
}

function issuePenalty(issues: OrteKnownIssue[]): number {
  let penalty = 100;
  for (const issue of issues) {
    if (issue.severity === 'High') penalty -= 20;
    else if (issue.severity === 'Medium') penalty -= 10;
    else if (issue.severity === 'Low') penalty -= 5;
  }
  return Math.max(0, penalty);
}

function engineReadinessScore(engine: OrteEngineInput): number {
  const unit = engine.unitTestsPassRate * 100;
  const integration = engine.integrationTestsPassRate * 100;
  const penalty = issuePenalty(engine.knownIssues);
  return clampScore(0.4 * unit + 0.4 * integration + 0.2 * penalty);
}

function integrationLinks(
  integration: OrteIntegrationInput,
): Array<{ key: string; link: OrteIntegrationLink }> {
  return Object.entries(integration)
    .filter((entry): entry is [string, OrteIntegrationLink] => entry[1] != null)
    .map(([key, link]) => ({ key, link }));
}

function integrationReadinessScore(integration: OrteIntegrationInput): number {
  let score = 100;

  for (const { link } of integrationLinks(integration)) {
    if (!link.implemented) {
      score -= 30;
    } else if (!link.tested) {
      score -= 20;
    }

    for (const issue of link.issues) {
      if (issue.severity === 'High') score -= 20;
      else if (issue.severity === 'Medium') score -= 10;
    }
  }

  return clampScore(score);
}

function nonFunctionalReadinessScore(
  nonFunctional: OrteNonFunctionalInput,
): number {
  let score = 100;
  const { performance, security, logging } = nonFunctional;

  if (!performance.loadTested) {
    score -= 15;
  }

  const maxObserved = performance.maxObservedResponseTimeMs;
  const target = performance.targetResponseTimeMs;
  if (maxObserved != null && target != null && maxObserved > target) {
    score -= 10;
  }

  if (!security.rolePermissionsTested) {
    score -= 20;
  }

  if (!logging.auditTrailImplemented) {
    score -= 20;
  }

  if (!logging.errorLoggingImplemented) {
    score -= 20;
  }

  return clampScore(score);
}

function recommendedActionForIssue(
  issue: OrteKnownIssue,
  context?: string,
): string {
  const prefix = context ? `${context}: ` : '';
  if (issue.severity === 'High') {
    return `${prefix}Resolve before launch — ${issue.description}`;
  }
  return `${prefix}Schedule remediation — ${issue.description}`;
}

function collectHighIssues(input: OrteAssessmentInput): OrteBlockingIssue[] {
  const blocking: OrteBlockingIssue[] = [];

  for (const engine of input.engines) {
    for (const issue of engine.knownIssues.filter(
      (i) => i.severity === 'High',
    )) {
      blocking.push({
        id: issue.id,
        description: `[${engine.name}] ${issue.description}`,
        recommendedAction: recommendedActionForIssue(issue, engine.name),
        priority: 'High',
      });
    }
  }

  for (const { key, link } of integrationLinks(input.integration)) {
    for (const issue of link.issues.filter((i) => i.severity === 'High')) {
      blocking.push({
        id: issue.id,
        description: `[Integration ${key}] ${issue.description}`,
        recommendedAction: recommendedActionForIssue(issue, key),
        priority: 'High',
      });
    }
  }

  return blocking;
}

function integrationKeyIssues(integration: OrteIntegrationInput): string[] {
  const issues: string[] = [];

  for (const { key, link } of integrationLinks(integration)) {
    if (!link.implemented) {
      issues.push(`${key}: not implemented`);
    } else if (!link.tested) {
      issues.push(`${key}: implemented but not tested`);
    }
    for (const issue of link.issues) {
      issues.push(
        `${key}: [${issue.severity}] ${issue.id} — ${issue.description}`,
      );
    }
  }

  return issues;
}

function nonFunctionalKeyIssues(
  nonFunctional: OrteNonFunctionalInput,
): string[] {
  const issues: string[] = [];
  const { performance, security, logging } = nonFunctional;

  if (!performance.loadTested) {
    issues.push('Performance load testing not executed');
  }
  const maxObserved = performance.maxObservedResponseTimeMs;
  const target = performance.targetResponseTimeMs;
  if (maxObserved != null && target != null && maxObserved > target) {
    issues.push(
      `Observed response time ${maxObserved}ms exceeds target ${target}ms`,
    );
  }
  if (!security.rolePermissionsTested) {
    issues.push('Role-based permissions not tested');
  }
  if (!logging.auditTrailImplemented) {
    issues.push('Audit trail not implemented');
  }
  if (!logging.errorLoggingImplemented) {
    issues.push('Error logging not implemented');
  }

  return issues;
}

function buildNextSteps(input: OrteAssessmentInput): string[] {
  const steps: string[] = [];

  for (const engine of input.engines) {
    for (const scenario of engine.testScenariosMissing) {
      steps.push(`[${engine.name}] Implement test scenario: ${scenario}`);
    }
    if (engine.integrationTestsPassRate < 1) {
      steps.push(
        `[${
          engine.name
        }] Improve integration test pass rate (currently ${Math.round(
          engine.integrationTestsPassRate * 100,
        )}%)`,
      );
    }
  }

  for (const { key, link } of integrationLinks(input.integration)) {
    if (!link.implemented) {
      steps.push(`Implement integration: ${key}`);
    } else if (!link.tested) {
      steps.push(`Add integration tests for ${key}`);
    }
  }

  const nf = input.nonFunctional;
  if (!nf.performance.loadTested) {
    steps.push('Run performance load test against production targets');
  }
  if (!nf.security.rolePermissionsTested) {
    steps.push('Execute role permission tests across safety modules');
  }
  if (!nf.logging.auditTrailImplemented) {
    steps.push('Implement audit trail for compliance engine actions');
  }
  if (!nf.logging.errorLoggingImplemented) {
    steps.push('Verify structured error logging for TAE/SPCE/SGAE flows');
  }

  const seen = new Set<string>();
  return steps.filter((s) => {
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  });
}

/**
 * Operational Readiness & Testing Engine — deterministic launch readiness assessment.
 */
export function evaluateOperationalReadiness(
  input: OrteAssessmentInput,
): OrteAssessmentResult {
  const engineScores = input.engines.map((engine) => ({
    engine,
    score: engineReadinessScore(engine),
  }));

  const engineReadiness = engineScores.map(({ engine, score }) => ({
    name: engine.name,
    score,
    classification: classifyReadiness(score),
    keyIssues: engine.knownIssues.map(
      (i) => `[${i.severity}] ${i.id}: ${i.description}`,
    ),
    missingScenarios: [...engine.testScenariosMissing],
  }));

  const avgEngineScore =
    engineScores.length > 0
      ? engineScores.reduce((sum, e) => sum + e.score, 0) / engineScores.length
      : 0;

  const integrationScore = integrationReadinessScore(input.integration);
  const nonFunctionalScore = nonFunctionalReadinessScore(input.nonFunctional);

  const overallLaunchReadinessScore = clampScore(
    avgEngineScore * 0.5 + integrationScore * 0.3 + nonFunctionalScore * 0.2,
  );

  const integrationReadiness = {
    score: integrationScore,
    classification: classifyReadiness(integrationScore),
    keyIssues: integrationKeyIssues(input.integration),
  };

  const nonFunctionalReadiness = {
    score: nonFunctionalScore,
    classification: classifyReadiness(nonFunctionalScore),
    keyIssues: nonFunctionalKeyIssues(input.nonFunctional),
  };

  const topBlockingIssues = collectHighIssues(input);

  const adjustedOverallScore = clampScore(
    overallLaunchReadinessScore - topBlockingIssues.length * 20,
  );

  const nextSteps = buildNextSteps(input);

  return {
    engineReadiness,
    integrationReadiness,
    nonFunctionalReadiness,
    overallLaunchReadinessScore: adjustedOverallScore,
    overallRecommendation: overallRecommendation(adjustedOverallScore),
    topBlockingIssues,
    nextSteps,
  };
}

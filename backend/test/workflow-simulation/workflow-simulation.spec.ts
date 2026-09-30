/**
 * Workflow simulation smoke — validates Vera Core lifecycle definitions in CI.
 * Run: npm run test:workflow-sim --prefix backend
 */
import { WorkflowSimulationEngine, ALL_WORKFLOWS } from '@vera/workflow-sim';

describe('Workflow simulation engine', () => {
  it('loads 12 lifecycle workflows', () => {
    expect(ALL_WORKFLOWS.length).toBe(12);
  });

  it('executes simulation suite', () => {
    const engine = new WorkflowSimulationEngine();
    const { report, definitionIssues } = engine.run();
    const defErrors = definitionIssues.filter((i) => i.severity === 'error');
    expect(defErrors).toHaveLength(0);
    expect(report.summary.passed).toBeGreaterThan(0);
    expect(report.summary.passed + report.summary.failed).toBe(
      report.summary.total,
    );
  });
});

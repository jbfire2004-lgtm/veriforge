import { logger } from "../../utils/logger";

/**
 * Cron jobs run in services/veriforge-saas-service (API + worker).
 * This module is the DDD registry of scheduled work.
 */
export const CRON_JOBS = [
  {
    id: "compliance_expiry_check",
    schedule: "0 2 * * *",
    description:
      "Mark expired ComplianceArtifacts, queue notifications, recalculate scorecards",
    script: "jobs/complianceExpiryCheck.ts",
  },
  {
    id: "scorecard_recalculation",
    schedule: "0 * * * *",
    description: "Recalculate compliance_score + global_score; upsert Scorecard",
    script: "jobs/scorecardRecalculation.ts",
  },
  {
    id: "notification_dispatcher",
    schedule: "*/5 * * * *",
    description: "Send queued email + in-app notifications; mark sent",
    script: "jobs/notificationDispatcher.ts",
  },
  {
    id: "billing_cycle_check",
    schedule: "0 3 * * *",
    description:
      "Suspend modules for overdue SubscriptionProfile; reactivate when paid",
    script: "jobs/billingCycleCheck.ts",
  },
  {
    id: "module_usage_tracker",
    schedule: "0 * * * *",
    description: "Snapshot module usage into module_usage_metrics",
    script: "jobs/moduleUsageTracker.ts",
  },
  {
    id: "trial_workflow",
    schedule: "15 9 * * *",
    description: "Expire trials, lock modules, send trial lifecycle emails",
    script: "jobs/trial-workflow.job.ts",
  },
] as const;

export async function runCronJob(id: (typeof CRON_JOBS)[number]["id"]) {
  logger.info("cron.run", { id });
  return { id, ok: true, note: "Execute via SaaS worker startAllCronJobs()" };
}

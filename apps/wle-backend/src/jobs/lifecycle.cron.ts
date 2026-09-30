import cron from "node-cron";
import { WorkerService } from "../services/worker.service";
import { ExpiryRulesService } from "../services/expiry-rules.service";
import { SupervisorService } from "../services/supervisor.service";

const workerService = new WorkerService();
const rulesService = new ExpiryRulesService();
const supervisorService = new SupervisorService();

export function startLifecycleCron() {
  // Runs every 24 hours at midnight server time.
  cron.schedule("0 0 * * *", async () => {
    try {
      const rules = await rulesService.getRules();
      const confirmationResult = await supervisorService.processLifecycleConfirmationRequests(rules);
      const result = await workerService.evaluateAllLifecycles(rules);
      // eslint-disable-next-line no-console
      console.log("[WLE] lifecycle cron completed", {
        ...result,
        ...confirmationResult,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[WLE] lifecycle cron failed", error);
    }
  });
}

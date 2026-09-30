import cron from "node-cron";
import { ExpiryRulesService } from "../services/expiry-rules.service";
import { OrientationService } from "../services/orientation.service";

const rulesService = new ExpiryRulesService();
const orientationService = new OrientationService();

export function startOrientationCron() {
  // Runs every day at 00:15 server time.
  cron.schedule("15 0 * * *", async () => {
    try {
      const rules = await rulesService.getRules();
      const result = await orientationService.autoExpireOrientations(
        rules.orientationExpiryDays,
      );
      // eslint-disable-next-line no-console
      console.log("[WLE] orientation cron completed", result);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[WLE] orientation cron failed", error);
    }
  });
}

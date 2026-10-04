import "dotenv/config";
import { createApp } from "./app";
import { startLifecycleCron } from "./jobs/lifecycle.cron";
import { startOrientationCron } from "./jobs/orientation.cron";

const app = createApp();
const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[WLE] backend listening on http://localhost:${port}`);
});

startLifecycleCron();
startOrientationCron();

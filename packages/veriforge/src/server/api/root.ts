import { orgRouter } from "./org";
import { clientRouter } from "./client";
import { developerRouter } from "./developer";
import { complianceRouter } from "./compliance";
import { scorecardsRouter } from "./scorecards";
import { modulesRouter } from "./modules";
import { billingRouter } from "./billing";
import { authRouter } from "./auth";

export const appRouter = {
  org: orgRouter,
  client: clientRouter,
  developer: developerRouter,
  compliance: complianceRouter,
  scorecards: scorecardsRouter,
  modules: modulesRouter,
  billing: billingRouter,
  auth: authRouter,
};

export type AppRouter = typeof appRouter;

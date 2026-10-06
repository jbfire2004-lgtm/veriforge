import { createTRPCRouter } from './trpc';
import { uploadRouter } from './routers/upload';
import { workerRouter } from './routers/worker';
import { trainingRouter } from './routers/training';
import { accessRouter } from './routers/access';
import { companyRouter } from './routers/company';
import { documentsRouter } from './routers/documents';
import { homepageRouter } from './routers/homepage';
import { feedRouter } from './routers/feed';
import { safetyBlogRouter } from './routers/safety-blog';
import { expertQaRouter } from './routers/expert-qa';
import { jobBoardRouter } from './routers/job-board';
import { socialRouter } from './routers/social';
import { seoRouter } from './routers/seo';
import { moderationRouter } from './routers/moderation';
import { orgRouter } from './routers/org';
import { clientRouter } from './routers/client';
import { developerRouter } from './routers/developer';
import { complianceRouter } from './routers/compliance';
import { scorecardsRouter } from './routers/scorecards';
import { modulesRouter } from './routers/modules';
import { billingRouter } from './routers/billing';
import { authRouter } from './routers/auth';
import { notificationsRouter } from './routers/notifications';
import { cronRouter } from './routers/cron';
// backward-compatible aliases
import { hiringClientRouter } from './routers/hiring-client';
import { subscriptionRouter } from './routers/subscription';
import { scorecardRouter } from './routers/scorecard';

/**
 * VeriForge tRPC API map (Nest backend → SaaS proxy).
 *
 * Namespaces match /api/{namespace}.{procedure}:
 *   org · client · developer · compliance · scorecards · modules · billing · auth · notifications · cron
 */
export const appRouter = createTRPCRouter({
  // --- VeriForge multi-tenant SaaS ---
  org: orgRouter,
  client: clientRouter,
  developer: developerRouter,
  compliance: complianceRouter,
  scorecards: scorecardsRouter,
  modules: modulesRouter,
  billing: billingRouter,
  auth: authRouter,
  notifications: notificationsRouter,
  cron: cronRouter,

  // --- Legacy Vera / VeriForge product routers ---
  upload: uploadRouter,
  worker: workerRouter,
  training: trainingRouter,
  access: accessRouter,
  company: companyRouter,
  documents: documentsRouter,
  homepage: homepageRouter,
  feed: feedRouter,
  safetyBlog: safetyBlogRouter,
  expertQa: expertQaRouter,
  jobBoard: jobBoardRouter,
  social: socialRouter,
  seo: seoRouter,
  moderation: moderationRouter,

  // --- Deprecated aliases (keep until clients migrate) ---
  hiringClient: hiringClientRouter,
  subscription: subscriptionRouter,
  scorecard: scorecardRouter,
});

export type AppRouter = typeof appRouter;

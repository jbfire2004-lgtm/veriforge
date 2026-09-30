/**
 * Legacy authenticated deep crawl — uses PLAYWRIGHT_STORAGE_STATE (defaults to admin).
 * Prefer role-specific specs: admin-deep-crawl, pm-deep-crawl, contractor-deep-crawl.
 */
import { authenticatedTest } from "../fixtures/vera-test";
import { installDeepCrawlMocks } from "../helpers/mock-api";
import {
  AUTHENTICATED_DEEP_CRAWL_DOMAINS,
  assertAuthenticatedDeepRoute,
} from "../helpers/deep-crawl";

const useMocks = process.env.PLAYWRIGHT_DEEP_CRAWL_MOCKS !== "0";

authenticatedTest.describe("deep crawl › authenticated (legacy)", () => {
  authenticatedTest.beforeEach(async ({ page }) => {
    if (useMocks) {
      await installDeepCrawlMocks(page);
    }
  });

  for (const domain of AUTHENTICATED_DEEP_CRAWL_DOMAINS) {
    authenticatedTest.describe(domain.label, () => {
      for (const route of domain.routes) {
        authenticatedTest(`${route.path} loads when signed in`, async ({ page }) => {
          await assertAuthenticatedDeepRoute(page, route);
        });
      }
    });
  }
});

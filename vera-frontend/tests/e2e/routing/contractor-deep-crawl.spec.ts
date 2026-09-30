import { contractorTest } from "../fixtures/vera-test";
import { installDeepCrawlMocks } from "../helpers/mock-api";
import {
  CONTRACTOR_DEEP_CRAWL_DOMAINS,
  assertAuthenticatedDeepRoute,
} from "../helpers/deep-crawl";

const useMocks = process.env.PLAYWRIGHT_DEEP_CRAWL_MOCKS !== "0";

contractorTest.describe("deep crawl › contractor", () => {
  contractorTest.beforeEach(async ({ page }) => {
    if (useMocks) {
      await installDeepCrawlMocks(page);
    }
  });

  for (const domain of CONTRACTOR_DEEP_CRAWL_DOMAINS) {
    contractorTest.describe(domain.label, () => {
      for (const route of domain.routes) {
        contractorTest(`${route.path} loads for contractor`, async ({ page }) => {
          await assertAuthenticatedDeepRoute(page, route);
        });
      }
    });
  }
});

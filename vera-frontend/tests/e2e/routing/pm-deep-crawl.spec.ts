import { pmTest } from "../fixtures/vera-test";
import { installDeepCrawlMocks } from "../helpers/mock-api";
import {
  PM_DEEP_CRAWL_DOMAINS,
  CORE_DEEP_CRAWL_DOMAINS,
  WALLET_DEEP_CRAWL_DOMAINS,
  assertAuthenticatedDeepRoute,
} from "../helpers/deep-crawl";

const useMocks = process.env.PLAYWRIGHT_DEEP_CRAWL_MOCKS !== "0";

const DOMAINS = [
  ...PM_DEEP_CRAWL_DOMAINS,
  ...CORE_DEEP_CRAWL_DOMAINS,
  ...WALLET_DEEP_CRAWL_DOMAINS,
];

pmTest.describe("deep crawl › pm / supervisor", () => {
  pmTest.beforeEach(async ({ page }) => {
    if (useMocks) {
      await installDeepCrawlMocks(page);
    }
  });

  for (const domain of DOMAINS) {
    pmTest.describe(domain.label, () => {
      for (const route of domain.routes) {
        pmTest(`${route.path} loads for pm`, async ({ page }) => {
          await assertAuthenticatedDeepRoute(page, route);
        });
      }
    });
  }
});

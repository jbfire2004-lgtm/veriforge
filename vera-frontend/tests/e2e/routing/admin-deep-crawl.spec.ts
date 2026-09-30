import { adminTest } from "../fixtures/vera-test";
import { installDeepCrawlMocks } from "../helpers/mock-api";
import {
  ADMIN_DEEP_CRAWL_DOMAINS,
  CORE_DEEP_CRAWL_DOMAINS,
  WALLET_DEEP_CRAWL_DOMAINS,
  assertAuthenticatedDeepRoute,
} from "../helpers/deep-crawl";

const useMocks = process.env.PLAYWRIGHT_DEEP_CRAWL_MOCKS !== "0";

const DOMAINS = [
  ...ADMIN_DEEP_CRAWL_DOMAINS,
  ...CORE_DEEP_CRAWL_DOMAINS,
  ...WALLET_DEEP_CRAWL_DOMAINS,
];

adminTest.describe("deep crawl › admin", () => {
  adminTest.beforeEach(async ({ page }) => {
    if (useMocks) {
      await installDeepCrawlMocks(page);
    }
  });

  for (const domain of DOMAINS) {
    adminTest.describe(domain.label, () => {
      for (const route of domain.routes) {
        adminTest(`${route.path} loads for admin`, async ({ page }) => {
          await assertAuthenticatedDeepRoute(page, route);
        });
      }
    });
  }
});

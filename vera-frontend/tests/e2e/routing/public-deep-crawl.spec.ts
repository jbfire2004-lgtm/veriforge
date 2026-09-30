import { test } from "@playwright/test";
import {
  PUBLIC_DEEP_CRAWL_DOMAINS,
  assertPublicDeepRoute,
} from "../helpers/deep-crawl";

test.describe("deep crawl › public", () => {
  for (const domain of PUBLIC_DEEP_CRAWL_DOMAINS) {
    test.describe(domain.label, () => {
      for (const route of domain.routes) {
        test(`${route.path} loads without server error`, async ({ page }) => {
          await assertPublicDeepRoute(page, route);
        });
      }
    });
  }
});

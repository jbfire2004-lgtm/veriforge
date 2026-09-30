import { authenticatedTest, expect } from "../fixtures/vera-test";
import { DEEP_MODULE_ROUTES } from "../helpers/nav-routes";

authenticatedTest.describe("routing › deep module entry points", () => {
  for (const route of DEEP_MODULE_ROUTES) {
    authenticatedTest(`${route} loads`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(500);
      await expect(page.locator("body")).not.toContainText("Application error");
    });
  }
});

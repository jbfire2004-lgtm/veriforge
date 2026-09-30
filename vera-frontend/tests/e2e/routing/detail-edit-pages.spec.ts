import { authenticatedTest, expect } from "../fixtures/vera-test";
import { DETAIL_EDIT_ROUTES } from "../helpers/nav-routes";

authenticatedTest.describe("routing › detail and edit pages", () => {
  for (const { path, expectText } of DETAIL_EDIT_ROUTES) {
    authenticatedTest(`${path} renders expected shell`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(500);
      await expect(page.locator("body")).toContainText(expectText);
    });
  }
});

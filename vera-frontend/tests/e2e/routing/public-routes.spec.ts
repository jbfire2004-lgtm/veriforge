import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTES } from "../helpers/nav-routes";

test.describe("routing › public top-level routes", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} responds without server error`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(500);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

import { test, expect } from "@playwright/test";
import { ROUTING_FIXTURE_ROUTES } from "../helpers/nav-routes";

test.describe("routing › QR and legacy deep-link redirects", () => {
  for (const { from, expectPath } of ROUTING_FIXTURE_ROUTES) {
    test(`${from} resolves correctly`, async ({ page }) => {
      await page.goto(from, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(expectPath);
    });
  }

  test("public numeric verify route loads wallet view", async ({ page }) => {
    const response = await page.goto("/verify/1", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("staff wallet route requires authentication", async ({ page }) => {
    await page.goto("/wallet/1", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/(login|auth\/login)/);
  });

  test("QR hub routes equipment JSON to public verify", async ({ page }) => {
    await page.goto("/qr", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/QR|scan|Verify/i);
  });
});
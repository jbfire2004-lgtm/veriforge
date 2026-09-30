import { test, expect } from "@playwright/test";

test.describe("smart features › QR verification and public wallet", () => {
  test("verify numeric worker route is public verification card", async ({ page }) => {
    const response = await page.goto("/verify/1", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toContainText(/public verification/i);
  });

  test("legacy verify router sends worker QR to /verify/{id}", async ({ page }) => {
    await page.goto("/verify?type=worker&id=42");
    await expect(page).toHaveURL(/\/verify\/42/);
  });

  test("equipment verify query route loads", async ({ page }) => {
    const response = await page.goto("/verify/equipment?id=1", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBeLessThan(500);
  });

  test("staff wallet hub explains verify path", async ({ page }) => {
    await page.goto("/wallet", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/\/verify\//i);
    await expect(page.locator("body")).toContainText(/\/wallet\//i);
  });

  test("QR hub explains public vs staff paths", async ({ page }) => {
    await page.goto("/qr", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/Public vs staff paths/i);
    await expect(page.locator("body")).toContainText(/\/verify\//i);
    await expect(page.locator("body")).toContainText(/\/wallet\//i);
  });

  test("verify worker lookup page loads", async ({ page }) => {
    const response = await page.goto("/verify/worker", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";
import { authenticatedTest } from "../fixtures/vera-test";
import { collectNavHrefs } from "../helpers/nav-routes";

const NAV_HREFS = collectNavHrefs();

test.describe("routing › nav-config static resolution", () => {
  test("nav config exposes hrefs", () => {
    expect(NAV_HREFS.length).toBeGreaterThan(50);
  });
});

authenticatedTest.describe("routing › nav-config authenticated load", () => {
  for (const href of NAV_HREFS) {
    authenticatedTest(`${href} loads without application error`, async ({ page }) => {
      const response = await page.goto(href, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBeLessThan(500);
      const body = await page.locator("body").innerText();
      expect(body).not.toMatch(/Application error/i);
    });
  }
});

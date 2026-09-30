import {
  installApiMocks,
  MOCK_INSPECTION_ID,
} from "../helpers/mock-api";
import { authenticatedTest, expect } from "../fixtures/vera-test";

authenticatedTest.describe("routing › breadcrumbs and back navigation", () => {
  authenticatedTest.beforeEach(async ({ page }) => {
    await installApiMocks(page, "inspection");
  });

  authenticatedTest("PM inspection detail back link returns to list", async ({
    page,
  }) => {
    await page.goto(
      `/pm/inspections/${MOCK_INSPECTION_ID}?projectId=1`,
      { waitUntil: "networkidle" },
    );

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /walk|E2E|Site/i,
    );

    const back = page.getByRole("link", { name: /Inspections/i });
    await expect(back).toBeVisible();
    await back.click();

    await expect(page).toHaveURL(/\/pm\/inspections/);
  });
});

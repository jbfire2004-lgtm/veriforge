import { authenticatedTest, expect } from "../fixtures/vera-test";
import {
  installApiMocks,
  MOCK_INSPECTION_ID,
  resetInspectionMockState,
  setInspectionMockStatus,
} from "../helpers/mock-api";

authenticatedTest.describe("smart features › automation and expiry", () => {
  authenticatedTest.beforeEach(async ({ page }) => {
    resetInspectionMockState();
    await installApiMocks(page, "full");
  });

  authenticatedTest.afterEach(() => {
    resetInspectionMockState();
  });

  authenticatedTest("draft safety meeting from submitted inspection", async ({
    page,
  }) => {
    setInspectionMockStatus("submitted");

    await page.goto(
      `/pm/inspections/${MOCK_INSPECTION_ID}?projectId=1`,
      { waitUntil: "domcontentloaded" },
    );

    await page.getByRole("button", { name: "Draft safety meeting" }).click();
    await expect(page).toHaveURL(/\/pm\/safety-meetings\/meet-e2e-1/, {
      timeout: 15_000,
    });
  });

  authenticatedTest("hub widgets surface training expiry warnings", async ({
    page,
  }) => {
    const widgetsLoaded = page.waitForResponse(
      (res) =>
        res.url().includes("/hub/widgets/summary") && res.status() === 200,
    );
    await page.goto("/hub/readiness", { waitUntil: "domcontentloaded" });
    await widgetsLoaded;
    await expect(
      page.getByRole("heading", { name: /Training expiring/i, level: 3 }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/1 expired/i)).toBeVisible();
  });
});

import { authenticatedTest, expect } from "../fixtures/vera-test";
import {
  installApiMocks,
  MOCK_INSPECTION_ID,
  mockPhotoCaptureResult,
  resetInspectionMockState,
} from "../helpers/mock-api";

async function gotoInspectionDetail(page: import("@playwright/test").Page) {
  await page.goto(
    `/pm/inspections/${MOCK_INSPECTION_ID}?projectId=1`,
    { waitUntil: "domcontentloaded" },
  );
  await expect(
    page
      .getByRole("heading", { name: /E2E Walk-around/i })
      .or(page.getByRole("button", { name: "Escalate to incident" })),
  ).toBeVisible({ timeout: 45_000 });
}

authenticatedTest.describe("inspection › PM inspection engine", () => {
  // Shared module mock state (inspectionLifecycle) — avoid parallel races.
  authenticatedTest.describe.configure({ mode: "serial" });

  authenticatedTest.beforeEach(async ({ page }) => {
    resetInspectionMockState();
    await installApiMocks(page, "inspection");
  });

  authenticatedTest("loads inspection detail with checklist inputs", async ({
    page,
  }) => {
    resetInspectionMockState();
    await gotoInspectionDetail(page);
    await expect(
      page.getByRole("heading", { name: /E2E Walk-around/i }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Housekeeping acceptable")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save draft" })).toBeVisible();
  });

  authenticatedTest("showIf reveals and hides nested checklist items", async ({
    page,
  }) => {
    resetInspectionMockState();
    await gotoInspectionDetail(page);
    await expect(page.getByText("Housekeeping acceptable")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Pass follow-up")).not.toBeVisible();
    await expect(page.getByText("Fail corrective note")).not.toBeVisible();

    await page.locator("select").first().selectOption("pass");
    await expect(page.getByText("Pass follow-up")).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByTestId("inspection-visibility-notice"),
    ).toContainText(/Shown/i);

    await page.locator("select").first().selectOption("fail");
    await expect(page.getByText("Pass follow-up")).not.toBeVisible();
    await expect(page.getByText("Fail corrective note")).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByTestId("inspection-visibility-notice"),
    ).toContainText(/Hidden/i);
  });

  authenticatedTest("saves answers and submits with scoring", async ({ page }) => {
    resetInspectionMockState();
    await gotoInspectionDetail(page);
    await expect(page.getByRole("button", { name: "Save draft" })).toBeVisible({
      timeout: 15_000,
    });
    await page.locator("select").first().selectOption("pass");
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByRole("button", { name: "Save draft" })).toBeEnabled({
      timeout: 10_000,
    });

    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText(/Score 100%/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  authenticatedTest("shows inline photo findings on linked checklist item", async ({
    page,
  }) => {
    resetInspectionMockState();
    await gotoInspectionDetail(page);
    await expect(page.getByText("Housekeeping acceptable")).toBeVisible({
      timeout: 15_000,
    });
    await page.locator("select").first().selectOption("pass");
    await expect(page.getByText("Pass follow-up")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("inspection-item-photo-findings")).toBeVisible();
    await expect(page.getByText("Debris in walkway")).toBeVisible();
    await expect(page.getByText("CAUTION TRIP HAZARD")).toBeVisible();
    await page.getByTestId("photo-thumbnail-find-e2e").click();
    await expect(page.getByTestId("inspection-photo-viewer")).toBeVisible();
  });

  authenticatedTest("photo capture triggers OCR stub and corrective actions", async ({
    page,
  }) => {
    resetInspectionMockState();
    await gotoInspectionDetail(page);
    await expect(page.getByText("Instant photo capture")).toBeVisible({
      timeout: 15_000,
    });

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: "hazard.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image-e2e"),
    });

    const stub = mockPhotoCaptureResult();
    await expect(page.getByText(stub.findings[0]!.title)).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(stub.correctiveActions[0]!.title)).toBeVisible();
    await expect(page.getByText(/OCR\/vision stub/i)).toBeVisible();
  });

  authenticatedTest("submitted inspection can escalate to incident (auto-workflow)", async ({
    page,
  }) => {
    const { setInspectionMockStatus } = await import("../helpers/mock-api");
    setInspectionMockStatus("submitted");

    await gotoInspectionDetail(page);
    await expect(
      page.getByRole("button", { name: "Escalate to incident" }),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Escalate to incident" }).click();
    await expect(page).toHaveURL(/\/pm\/incidents\/inc-e2e-1/, {
      timeout: 15_000,
    });
  });
});

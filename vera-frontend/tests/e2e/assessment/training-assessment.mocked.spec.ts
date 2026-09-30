import { authenticatedTest, expect } from "../fixtures/vera-test";
import { installApiMocks, MOCK_WORKER_ID } from "../helpers/mock-api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

authenticatedTest.describe("assessment › training assessment engine (TAE)", () => {
  authenticatedTest.beforeEach(async ({ page }) => {
    await installApiMocks(page, "assessment");
  });

  authenticatedTest("mock API returns scoring and pass/fail status", async ({
    page,
  }) => {
    await page.goto("/hub", { waitUntil: "domcontentloaded" });

    const summary = await page.evaluate(
      async ({ base, workerId }) => {
        const res = await fetch(
          `${base}/api/v1/assessment-engines/training/worker/${workerId}/latest`,
          {
            headers: { Authorization: "Bearer e2e-mock-token" },
          },
        );
        return res.json();
      },
      { base: API_BASE, workerId: MOCK_WORKER_ID },
    );

    const latest = summary.data ?? summary;
    expect(latest.overallStatus).toBe("PASS");
    expect(latest.overallScore).toBe(88);
  });

  authenticatedTest("POST assessment persists run via mock backend", async ({
    page,
  }) => {
    await page.goto("/hub", { waitUntil: "domcontentloaded" });

    const created = await page.evaluate(
      async ({ base, workerId }) => {
        const res = await fetch(
          `${base}/api/v1/assessment-engines/training/worker/${workerId}`,
          {
            method: "POST",
            headers: { Authorization: "Bearer e2e-mock-token" },
          },
        );
        return res.json();
      },
      { base: API_BASE, workerId: MOCK_WORKER_ID },
    );

    const body = created.data ?? created;
    expect(body.runId).toBeTruthy();
    expect(body.result ?? body).toBeTruthy();
  });

  authenticatedTest.describe("worker profile UI", () => {
    authenticatedTest.beforeEach(({}, testInfo) => {
      if (process.env.PLAYWRIGHT_E2E_BACKEND !== "1") {
        testInfo.skip(
          true,
          "Admin worker RSC loads worker via server fetch — set PLAYWRIGHT_E2E_BACKEND=1 or use integration job.",
        );
      }
    });

    authenticatedTest("renders panel with score on admin worker profile", async ({
      page,
    }) => {
      await page.goto(`/admin/workers/${MOCK_WORKER_ID}`, {
        waitUntil: "networkidle",
      });

      await expect(page.getByText("Training assessment")).toBeVisible();
      await expect(page.getByText(/PASS/i)).toBeVisible();
      await expect(page.getByText(/score 88/i)).toBeVisible();

      await page.getByRole("button", { name: /Run assessment/i }).click();
      await expect(
        page.getByRole("button", { name: /Run assessment/i }),
      ).toBeEnabled({ timeout: 15_000 });
    });
  });
});

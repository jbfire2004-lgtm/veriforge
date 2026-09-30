import { authenticatedTest, expect } from "../fixtures/vera-test";

import {

  installApiMocks,

  MOCK_WORKER_ID,

} from "../helpers/mock-api";



authenticatedTest.describe("assessment › Safety Knowledge Engine (SKE)", () => {

  authenticatedTest.beforeEach(async ({ page }) => {

    await installApiMocks(page, "ske");

  });



  authenticatedTest("loads engine and evaluates with score display", async ({ page }) => {

    const accessReady = page.waitForResponse(

      (res) =>

        res.url().includes("/access/check") &&

        res.request().method() === "POST" &&

        res.status() === 200,

    );

    await page.goto(`/core/safety-knowledge?workerId=${MOCK_WORKER_ID}`, {

      waitUntil: "domcontentloaded",

    });

    await accessReady;

    await expect(

      page.getByRole("heading", { name: /Safety Knowledge/i }),

    ).toBeVisible({ timeout: 30_000 });

    await expect(page.getByText(/Proficient/i)).toBeVisible();

    await expect(page.getByText(/82\/100/)).toBeVisible();

    await page.getByRole("button", { name: "Evaluate knowledge" }).click();

    await expect(page.getByText("CompanyTraining")).toBeVisible();

    await expect(page.getByText("Refresh fall protection module")).toBeVisible();

  });



  authenticatedTest("loads latest when worker is picked from search", async ({

    page,

  }) => {

    await page.goto("/core/safety-knowledge", { waitUntil: "domcontentloaded" });

    await page.getByPlaceholder("Search workers by name…").fill("E2E");

    await page.getByRole("button", { name: /E2E Worker/i }).click();

    await expect(page.getByText(/Proficient/i)).toBeVisible();

    await expect(page).toHaveURL(

      new RegExp(`/core/safety-knowledge\\?workerId=${MOCK_WORKER_ID}`),

    );

  });



  authenticatedTest.describe("worker profile panel", () => {

    authenticatedTest.beforeEach(({}, testInfo) => {

      if (process.env.PLAYWRIGHT_E2E_BACKEND !== "1") {

        testInfo.skip(

          true,

          "Worker admin page requires server-side worker fetch (PLAYWRIGHT_E2E_BACKEND=1).",

        );

      }

    });



    authenticatedTest("reflects evaluation on admin worker profile", async ({

      page,

    }) => {

      await page.goto(`/admin/workers/${MOCK_WORKER_ID}`, {

        waitUntil: "domcontentloaded",

      });



      await expect(page.getByText("Safety Knowledge")).toBeVisible();

      await expect(page.getByText(/Proficient/i)).toBeVisible();

      await page.getByRole("button", { name: "Evaluate" }).click();

      await expect(page.getByText("CompanyTraining")).toBeVisible();

      await expect(

        page.getByRole("link", { name: "Open in Core" }),

      ).toHaveAttribute("href", `/core/safety-knowledge?workerId=${MOCK_WORKER_ID}`);

    });

  });

});


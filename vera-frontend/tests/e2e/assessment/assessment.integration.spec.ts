import { authenticatedTest, expect } from "../fixtures/vera-test";
import { skipUnlessBackend } from "../helpers/auth";

/**
 * Full-stack checks — require live API (PLAYWRIGHT_E2E_BACKEND=1) and auth storage.
 * Validates real scoring persistence, not UI mocks.
 */
authenticatedTest.describe("assessment › integration (live API)", () => {
  authenticatedTest.beforeEach(({}, testInfo) => {
    const reason = skipUnlessBackend();
    if (reason) testInfo.skip(true, reason);
  });

  authenticatedTest("POST training assessment returns runId", async ({
    page,
    request,
  }) => {
    const workerId = Number(process.env.PLAYWRIGHT_TEST_WORKER_ID ?? "1");
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    const token = await page.evaluate(async () => {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      return data.accessToken as string | undefined;
    });

    authenticatedTest.skip(!token, "Session token required for API integration");

    const res = await request.post(
      `${apiBase}/api/v1/assessment-engines/training/worker/${workerId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const data = body.data ?? body;
    expect(data.runId ?? data.result).toBeTruthy();
  });
});

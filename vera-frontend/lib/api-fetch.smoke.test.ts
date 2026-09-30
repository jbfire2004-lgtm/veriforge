import { describe, expect, test, vi } from "vitest";
import { apiFetch } from "@/lib/api-fetch";

vi.mock("next-auth/react", () => ({
  getSession: vi.fn(async () => null),
}));

describe("apiFetch", () => {
  test("attaches Authorization bearer token from session", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    try {
      await apiFetch("/workers", {
        session: { accessToken: "token_123" } as any,
      });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [, init] = fetchSpy.mock.calls[0];
      const headers = new Headers(init?.headers as HeadersInit);
      expect(headers.get("Authorization")).toBe("Bearer token_123");
      expect(headers.get("Accept")).toBe("application/json");
    } finally {
      fetchSpy.mockRestore();
    }
  });

  test("public routes skip session lookup and send no Authorization header", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    try {
      await apiFetch("/auth/refresh", { requireAuth: false, method: "POST" });
      const [, init] = fetchSpy.mock.calls[0];
      const headers = new Headers(init?.headers as HeadersInit);
      expect(headers.get("Authorization")).toBeNull();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  test("throws runtime error when token is missing for protected route", async () => {
    const prevWindow = (globalThis as any).window;
    (globalThis as any).window = {} as Window & typeof globalThis;
    try {
      await expect(
        apiFetch("/workers", {
          requireAuth: true,
        })
      ).rejects.toThrow(/Missing auth token/i);
    } finally {
      (globalThis as any).window = prevWindow;
    }
  });
});

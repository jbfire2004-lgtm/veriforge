import { describe, it, expect } from "vitest";
import type { SeoSitemapEntry } from "@vera/api-contract";
import { seoEntriesToNextSitemap } from "./sitemap";

describe("seoEntriesToNextSitemap", () => {
  it("maps engine entries to Next sitemap rows", () => {
    const entries: SeoSitemapEntry[] = [
      {
        type: "JOB",
        path: "/jobs/foo",
        lastModified: "2026-01-01T00:00:00.000Z",
        changeFrequency: "weekly",
        priority: 0.8,
      },
    ];
    const rows = seoEntriesToNextSitemap("https://vera.test", entries);
    expect(rows[0]?.url).toBe("https://vera.test/jobs/foo");
    expect(rows[0]?.priority).toBe(0.8);
  });
});

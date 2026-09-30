import { describe, expect, it } from "vitest";
import { articleJsonLd, siteUrl } from "@/lib/safety-blog/seo";

describe("safety-blog seo", () => {
  it("builds article JSON-LD", () => {
    const ld = articleJsonLd({
      id: "1",
      slug: "test-article",
      title: "Test",
      excerpt: "Summary",
      authorName: "Author",
      authorType: "EXPERT",
      imageUrl: null,
      category: "safety",
      safetyLevel: "LOW",
      readMinutes: 5,
      featured: false,
      publishedAt: new Date().toISOString(),
    });
    expect(ld["@type"]).toBe("Article");
    expect(ld.url).toContain("/safety/test-article");
  });

  it("siteUrl returns a string", () => {
    expect(typeof siteUrl()).toBe("string");
  });
});

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/safety-blog/seo";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/safety",
        "/safety/",
        "/experts",
        "/experts/",
        "/experts/profile/",
        "/jobs",
        "/jobs/",
      ],
      disallow: ["/admin/", "/api/", "/auth/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

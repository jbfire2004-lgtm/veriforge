import { describe, expect, it } from "vitest";
import {
  AUTHENTICATED_DEEP_CRAWL_DOMAINS,
  PUBLIC_DEEP_CRAWL_DOMAINS,
  flattenDomains,
} from "./e2e/helpers/deep-crawl";

describe("e2e deep crawl route catalogs", () => {
  it("defines public domains for QR, wallet, and marketing", () => {
    const ids = PUBLIC_DEEP_CRAWL_DOMAINS.map((d) => d.id);
    expect(ids).toContain("qr");
    expect(ids).toContain("home");
    expect(ids).toContain("public-docs");
    const paths = flattenDomains(PUBLIC_DEEP_CRAWL_DOMAINS).map((r) => r.path);
    expect(paths).toContain("/qr");
    expect(paths.some((p) => p.startsWith("/verify/"))).toBe(true);
    expect(paths).toContain("/scan/worker/42");
  });

  it("defines authenticated domains for PM, SMS, contractor, wallet, inspections", () => {
    const ids = AUTHENTICATED_DEEP_CRAWL_DOMAINS.map((d) => d.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "pm-projects",
        "pm-inspections",
        "pm-sif-sms",
        "contractor-portal",
        "wallet-staff",
        "core-readiness",
      ]),
    );
    const paths = flattenDomains(AUTHENTICATED_DEEP_CRAWL_DOMAINS).map((r) => r.path);
    expect(paths).toContain("/pm/sms");
    expect(paths).toContain("/contractor");
    expect(paths).toContain("/wallet");
    expect(paths).toContain("/pm/inspections");
    expect(paths).toContain("/pm/inspections/insp-e2e-001");
  });
});

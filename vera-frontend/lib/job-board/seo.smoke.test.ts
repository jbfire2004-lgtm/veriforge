import { describe, it, expect } from "vitest";
import { jobPostingJsonLd } from "./seo";
import type { JobBoardJobDetail } from "@vera/api-contract";

const sample: JobBoardJobDetail = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "test-electrician",
  title: "Test Electrician",
  companyName: "Test Co",
  location: "Edmonton, AB",
  locationCity: "Edmonton",
  locationRegion: "AB",
  trade: "Electrical",
  payRange: "$40/hr",
  payMin: 40,
  payMax: 45,
  payPeriod: "hourly",
  experienceLevel: "JOURNEYMAN",
  summary: "Test role",
  publishedAt: new Date().toISOString(),
  description: "Full description",
  companyId: null,
  projectId: null,
  ticketNames: ["WHMIS"],
};

describe("jobPostingJsonLd", () => {
  it("emits JobPosting schema", () => {
    const ld = jobPostingJsonLd(sample, "https://vera.example");
    expect(ld["@type"]).toBe("JobPosting");
    expect(ld.title).toBe("Test Electrician");
    expect(ld.url).toContain("/jobs/test-electrician");
    expect(ld.qualifications).toBe("WHMIS");
  });
});

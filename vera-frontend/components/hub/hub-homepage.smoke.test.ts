import { describe, expect, it } from "vitest";
import { mapSessionRoleToHubRole, shouldShowSection } from "@/lib/hub/hub-roles";
import { jobPostingJsonLd } from "@/lib/hub/json-ld";

describe("Vera Hub homepage helpers", () => {
  it("maps worker role to WORKER hub role", () => {
    expect(mapSessionRoleToHubRole("WORKER")).toBe("WORKER");
    expect(mapSessionRoleToHubRole("SUPERVISOR")).toBe("SUPERVISOR");
    expect(mapSessionRoleToHubRole("COMPANY_ADMIN")).toBe("COMPANY_ADMIN");
    expect(mapSessionRoleToHubRole("UNION_HALL_ADMIN")).toBe("UNION_HALL");
  });

  it("filters sections by role config", () => {
    expect(shouldShowSection(["feed", "weather"], "feed")).toBe(true);
    expect(shouldShowSection(["feed"], "trending")).toBe(false);
  });

  it("emits JobPosting JSON-LD", () => {
    const ld = jobPostingJsonLd(
      {
        id: "00000000-0000-4000-8000-000000000001",
        title: "Electrician",
        companyName: "Acme",
        location: "Calgary",
        trade: "Electrical",
        payRange: "$40/hr",
        summary: "Commercial work",
        url: null,
        publishedAt: "2026-05-01T00:00:00.000Z",
      },
      "https://vera.app",
    );
    expect(ld["@type"]).toBe("JobPosting");
    expect(ld.title).toBe("Electrician");
  });
});

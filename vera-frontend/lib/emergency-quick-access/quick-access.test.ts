import { describe, expect, it } from "vitest";
import {
  buildEmergencyQuickAccessPack,
  quickAccessCacheKey,
  VERIFIED_UTILITY_CONTACTS,
} from "@/lib/emergency-quick-access";

describe("emergency quick access pack", () => {
  it("includes Call 911 and verified SK utilities", () => {
    const pack = buildEmergencyQuickAccessPack({
      projectId: 9,
      companyId: 2,
      regionCode: "CA-SK",
      scenario: "gas" as never,
    });
    // invalid scenario falls back to general
    expect(pack.scenario).toBe("general");
    expect(pack.immediateActions[0]?.phone).toBe("911");
    expect(pack.contacts.some((c) => c.phone === "911")).toBe(true);
    const sask = pack.contacts.find((c) => c.id === "util-sk-saskenergy");
    expect(sask?.phone).toBe("1-888-700-0421");
    expect(sask?.verified).toBe(true);
    expect(pack.musterPoints.some((m) => m.primary)).toBe(true);
    expect(pack.equipment.length).toBeGreaterThan(0);
    expect(pack.procedures.length).toBeGreaterThan(0);
    expect(pack.offline.cacheKey).toBe(quickAccessCacheKey(9, 2));
  });

  it("does not invent site phones when unset", () => {
    const pack = buildEmergencyQuickAccessPack({ regionCode: "CA-AB" });
    const site = pack.contacts.find((c) => c.id === "site-coordinator");
    expect(site?.phone).toBeNull();
    expect(site?.verified).toBe(false);
    expect(
      VERIFIED_UTILITY_CONTACTS.some((u) => u.phone === "1-800-511-3447"),
    ).toBe(true);
    expect(
      pack.hazardRouting.some((h) =>
        /ATCO Electric|SaskPower|SaskEnergy|OHS|fire/i.test(h.reason),
      ),
    ).toBe(true);
  });
});

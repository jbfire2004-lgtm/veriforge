import { describe, expect, it } from "vitest";
import {
  fetchActivePermits,
  fetchPermitHistory,
  fetchPermitTypes,
  fetchPermits,
} from "@/lib/pm-permits";

describe("pm-permits", () => {
  it("targets Vera Core permit endpoints", () => {
    expect(fetchPermitTypes.name).toBe("fetchPermitTypes");
    expect(fetchPermits.name).toBe("fetchPermits");
    expect(fetchActivePermits.name).toBe("fetchActivePermits");
    expect(fetchPermitHistory.name).toBe("fetchPermitHistory");
  });
});

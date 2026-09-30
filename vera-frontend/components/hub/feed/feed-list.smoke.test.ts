import { describe, expect, it } from "vitest";
import { SOURCE_LABEL } from "./cards/FeedCardBase";

describe("FeedList smoke", () => {
  it("labels all feed sources", () => {
    expect(SOURCE_LABEL.VERA_CORE_TRAINING).toBe("Training");
    expect(SOURCE_LABEL.TRAINING_EXPIRY).toBe("Expiring");
    expect(SOURCE_LABEL.UNION_DISPATCH).toBe("Dispatch");
    expect(Object.keys(SOURCE_LABEL).length).toBeGreaterThanOrEqual(10);
  });
});

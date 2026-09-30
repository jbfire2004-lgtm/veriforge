import { describe, expect, it } from "vitest";
import {
  READINESS_STATE_LABELS,
  readinessStateStyles,
  scoreToVisualState,
} from "@/lib/readiness-display";

describe("readiness display helpers", () => {
  it("maps scores to visual states consistently", () => {
    expect(scoreToVisualState(95)).toBe("OK");
    expect(scoreToVisualState(70)).toBe("AT_RISK");
    expect(scoreToVisualState(40, 1)).toBe("NON_COMPLIANT");
  });

  it("exposes state labels and styles", () => {
    expect(READINESS_STATE_LABELS.OK).toBe("OK");
    expect(READINESS_STATE_LABELS.AT_RISK).toBe("At risk");
    expect(readinessStateStyles("OK").badge).toContain("teal");
    expect(readinessStateStyles("NON_COMPLIANT").badge).toContain("red");
  });
});


import { describe, expect, it } from "vitest";
import {
  buildRegulationAwareMeetingDraft,
  suggestRegulationTopics,
} from "@/lib/veripm-safety-meetings-hub/meeting-draft-engine";

describe("regulation-aware meeting draft engine", () => {
  it("builds a CSA-grounded fall protection toolbox talk", () => {
    const draft = buildRegulationAwareMeetingDraft({
      title: "Fall protection",
      meetingType: "toolbox_talk",
    });
    expect(draft.category).toBe("Fall protection");
    expect(draft.risk).toBe("critical");
    expect(draft.discussionPoints.length).toBeGreaterThan(3);
    expect(draft.requiredControls.length).toBeGreaterThan(2);
    expect(draft.regulations.some((r) => r.framework === "CSA")).toBe(true);
    expect(draft.regulations.some((r) => /Z259/.test(r.code))).toBe(true);
    expect(draft.durationMinutes).toBe(12);
  });

  it("suggests catalog topics including fall protection", () => {
    const topics = suggestRegulationTopics("fall");
    expect(topics.some((t) => /fall/i.test(t.title))).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { SocialActivityVerbSchema } from "@vera/api-contract";

describe("social contract", () => {
  it("accepts activity verbs", () => {
    expect(SocialActivityVerbSchema.parse("LIKE")).toBe("LIKE");
    expect(SocialActivityVerbSchema.parse("FOLLOW")).toBe("FOLLOW");
  });
});
